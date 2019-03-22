/*jslint node: true */
"use strict";

const fs = require('fs');
const db = require('ocore/db.js');
const eventBus = require('ocore/event_bus.js');
const headlessWallet = require('headless-obyte/start.js');
const constants = require('ocore/constants.js');
const objectHash = require('ocore/object_hash.js');
const Mnemonic = require('bitcore-mnemonic');
const ecdsaSig = require('ocore/signature.js');
const validation = require('ocore/validation.js');

const configPath = "../wallets/";


const witness_budget = 1000000;
const witness_budget_count = 8;

const witnessConfigFile = configPath+"witness-config.json";
const genesisConfigFile = configPath+"genesis-config.json";

let witnesses = [];
let genesis_address;

let walletConfigData = {};
let arrOutputs = [];

const creation_message = "In byteball we trust";


function onError(err) {
	if (err) {
		throw Error(err);
	}
}


function loadWalletConfig(onDone) {
    // Read genesis config file
    let data = fs.readFileSync(genesisConfigFile, 'utf8');
    let wallet = JSON.parse(data);
    genesis_address = wallet['address'];
    walletConfigData[wallet['address']] = wallet;
    arrOutputs.push({ address: genesis_address, amount: 0 });

    // Read witness config file
    data = fs.readFileSync(witnessConfigFile, 'utf8');    
    let wallets = JSON.parse(data);

    for (let wallet of wallets) {
        walletConfigData[wallet['address']] = wallet;
        witnesses.push(wallet['address']);

        for(let i = 0; i < witness_budget_count; ++i) {
            arrOutputs.push({address: wallet['address'], amount: witness_budget});
        }
    }
    witnesses = witnesses.sort();
    onDone();
}


function getDerivedKey(mnemonic_phrase, passphrase, account, is_change, address_index) {
    //console.log("**************************************************************");
    //console.log(mnemonic_phrase);

    let mnemonic = new Mnemonic(mnemonic_phrase);
    let xPrivKey = mnemonic.toHDPrivateKey(passphrase);
    //console.log(">> about to  signature with private key: " + xPrivKey);
    let path = "m/44'/0'/" + account + "'/"+is_change+"/"+address_index;
    let derivedPrivateKey = xPrivKey.derive(path).privateKey;
    //console.log(">> derived key: " + derivedPrivateKey);
    return derivedPrivateKey.bn.toBuffer({size:32});        // return as buffer
}


// signer that uses witness address
let signer = {
    readSigningPaths: function(conn, address, handleLengthsBySigningPaths) {
        handleLengthsBySigningPaths({r: constants.SIG_LENGTH});
    },
    readDefinition: function(conn, address, handleDefinition) {
        let wallet = walletConfigData[address];
        let definition = wallet["definition"];
        handleDefinition(null, definition);
    },
    sign: function(objUnsignedUnit, assocPrivatePayloads, address, signing_path, handleSignature) {
        let buf_to_sign = objectHash.getUnitHashToSign(objUnsignedUnit);
        let wallet = walletConfigData[address];
        let derivedPrivateKey = getDerivedKey(
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
    let composer = require('ocore/composer.js');
    let network = require('ocore/network.js');

    let savingCallbacks = composer.getSavingCallbacks({
        ifNotEnoughFunds: onError,
        ifError: onError,
        ifOk: function(objJoint) {
            network.broadcastJoint(objJoint);
            onDone(objJoint.unit.unit);
        }
    });

    composer.setGenesis(true);

    let genesisUnitInput = {
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


eventBus.once('headless_wallet_ready', function() {
    console.log("> Create genesis unit");
    loadWalletConfig(function() {
        createGenesisUnit(function(genesisHash) {
            console.log("\n\nGenesis unit: " + genesisHash+ "\n\n");
            let placeholders = Array.apply(null, Array(witnesses.length)).map(function(){ return '(?)'; }).join(',');
            db.query("REPLACE INTO my_witnesses (address) VALUES "+placeholders, witnesses, function() {
                console.log('inserted witnesses');
            });
        });
    });
});
