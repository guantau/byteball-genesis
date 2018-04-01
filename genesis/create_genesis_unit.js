/*jslint node: true */
"use strict";

const fs = require('fs');
const db = require('byteballcore/db.js');
const eventBus = require('byteballcore/event_bus.js');
var headlessWallet = require('headless-byteball/start.js');
const constants = require('byteballcore/constants.js');
var objectHash = require('byteballcore/object_hash.js');
var Mnemonic = require('bitcore-mnemonic');
var ecdsaSig = require('byteballcore/signature.js');
var validation = require('byteballcore/validation.js');

const configPath = "../wallets/";


const witness_budget = 1000000;
const witness_budget_count = 8;

const witnessConfigFile = configPath+"witness-config.json";
const genesisConfigFile = configPath+"genesis-config.json";
const payingConfigFile = configPath+"paying-config.json";
const payeeConfigFile = configPath+"payee-config.json";

var witnesses = [];
var change_address;
var paying_address;
var payee_address;

var walletConfigData = {};
var arrOutputs = [];

const creation_message = "In blockchain we trust"


function onError(err) {
	if (err) {
		throw Error(err);
	}
}


function loadWalletConfig(onDone) {
    // Read genesis config file
    var data = fs.readFileSync(genesisConfigFile, 'utf8');
    var wallet = JSON.parse(data);
    change_address = wallet['address'];
    walletConfigData[wallet['address']] = wallet;
    arrOutputs.push({ address: change_address, amount: 0 });

    // Read paying config file
    data = fs.readFileSync(payingConfigFile, 'utf8');
    wallet = JSON.parse(data);
    paying_address = wallet['address'];
    walletConfigData[wallet['address']] = wallet;
    for(var i = 0; i < witness_budget_count; ++i) {
        arrOutputs.push({ address: wallet['address'], amount: witness_budget });
    }

    // Read payee config file
    data = fs.readFileSync(payeeConfigFile, 'utf8');
    wallet = JSON.parse(data);
    payee_address = wallet['address'];
    walletConfigData[wallet['address']] = wallet;
    for(var i = 0; i < witness_budget_count; ++i) {
        arrOutputs.push({ address: wallet['address'], amount: witness_budget });
    }

    // Read witness config file
    data = fs.readFileSync(witnessConfigFile, 'utf8');    
    var wallets = JSON.parse(data);

    for (let wallet of wallets) {
        walletConfigData[wallet['address']] = wallet;
        witnesses.push(wallet['address']);

        for(var i = 0; i < witness_budget_count; ++i) {
            arrOutputs.push({address: wallet['address'], amount: witness_budget});
        }
    }
    witnesses = witnesses.sort();
    onDone();
}


function getDerivedKey(mnemonic_phrase, passphrase, account, is_change, address_index) {
    //console.log("**************************************************************");
    //console.log(mnemonic_phrase);

    var mnemonic = new Mnemonic(mnemonic_phrase);
    var xPrivKey = mnemonic.toHDPrivateKey(passphrase);
    //console.log(">> about to  signature with private key: " + xPrivKey);
    var path = "m/44'/0'/" + account + "'/"+is_change+"/"+address_index;
    var derivedPrivateKey = xPrivKey.derive(path).privateKey;
    //console.log(">> derived key: " + derivedPrivateKey);
    return derivedPrivateKey.bn.toBuffer({size:32});        // return as buffer
}


// signer that uses witness address
var signer = {
    readSigningPaths: function(conn, address, handleLengthsBySigningPaths) {
        handleLengthsBySigningPaths({r: constants.SIG_LENGTH});
    },
    readDefinition: function(conn, address, handleDefinition) {
        var wallet = walletConfigData[address];
        var definition = wallet["definition"];
        handleDefinition(null, definition);
    },
    sign: function(objUnsignedUnit, assocPrivatePayloads, address, signing_path, handleSignature) {
        var buf_to_sign = objectHash.getUnitHashToSign(objUnsignedUnit);
        var wallet = walletConfigData[address];
        var derivedPrivateKey = getDerivedKey(
            wallet["mnemonic_phrase"],
            wallet["passphrase"],
            0,
            wallet["is_change"],
            wallet["address_index"]
          );
        handleSignature(null, ecdsaSig.sign(buf_to_sign, derivedPrivateKey));
    }
};


function createGenesisUnit(onDone) {
    var composer = require('byteballcore/composer.js');
    var network = require('byteballcore/network.js');

    var savingCallbacks = composer.getSavingCallbacks({
        ifNotEnoughFunds: onError,
        ifError: onError,
        ifOk: function(objJoint) {
            network.broadcastJoint(objJoint);
            onDone(objJoint.unit.unit);
        }
    });

    composer.setGenesis(true);

    var genesisUnitInput = {
        witnesses: witnesses,
        paying_addresses: witnesses,
        outputs: arrOutputs,
        signer: signer,
        callbacks: {
            ifNotEnoughFunds: onError,
            ifError: onError,
            ifOk: function(objJoint, assocPrivatePayloads, composer_unlock) {
                constants.GENESIS_UNIT = objJoint.unit.unit;
                savingCallbacks.ifOk(objJoint, assocPrivatePayloads, composer_unlock);
            }
        },
        messages: [{
            app: "text",
            payload_location: "inline",
            payload_hash: objectHash.getBase64Hash(creation_message),
            payload: creation_message
        }]
    };
    composer.composeJoint( genesisUnitInput );
}


function createPayment(from_address){
    console.log('starting createPayment');
    var composer = require('byteballcore/composer.js');
    var network = require('byteballcore/network.js');
    var callbacks = composer.getSavingCallbacks({
        ifNotEnoughFunds: onError,
        ifError: onError,
        ifOk: function(objJoint){
            network.broadcastJoint(objJoint);
        }
    });

    var arrOutputs = [
        {address: paying_address, amount: 0},    // the change
        {address: payee_address, amount: 100}  // the receiver
    ];
    composer.setGenesis(false);
    composer.composePaymentJoint([paying_address], arrOutputs, headlessWallet.signer, callbacks);
}


eventBus.once('headless_wallet_ready', function() {
    console.log("> Create payment");
    loadWalletConfig(function() {
        createGenesisUnit(function(genesisHash) {
            console.log("\n\nGenesis unit: " + genesisHash+ "\n\n");
            setTimeout(createPayment, 1000*30);

            // var placeholders = Array.apply(null, Array(witnesses.length)).map(function(){ return '(?)'; }).join(',');
            // console.log('will insert witnesses', witnesses);
            // var witnesslist = witnesses;
            // db.query("INSERT INTO my_witnesses (address) VALUES "+placeholders, witnesses, function() {
            //     console.log('inserted witnesses');
            //     setTimeout(createPayment, 1000*30);
            // });
        });
    });
});
