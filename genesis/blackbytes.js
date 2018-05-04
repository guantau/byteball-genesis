/*jslint node: true */
"use strict";
const fs = require('fs');
const db = require('byteballcore/db.js');
const eventBus = require('byteballcore/event_bus.js');
const headlessWallet = require('headless-byteball/start.js');
const constants = require('byteballcore/constants.js');
const objectHash = require('byteballcore/object_hash.js');
const Mnemonic = require('bitcore-mnemonic');
const ecdsaSig = require('byteballcore/signature.js');
const validation = require('byteballcore/validation.js');

const configPath = "../wallets/";

const genesisConfigFile = configPath+"genesis-config.json";

let genesis_address;
let walletConfigData = {};


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


function createBlackbytes(onDone){
	let composer = require('byteballcore/composer.js');
	let network = require('byteballcore/network.js');

	let callbacks = composer.getSavingCallbacks({
		ifNotEnoughFunds: onError,
		ifError: onError,
		ifOk: function(objJoint){
			network.broadcastJoint(objJoint);
			onDone(objJoint.unit.unit);
		}
	});
	let asset = {
		cap: (1+2*2+5+10+20*2+50+100+200*2+500+1000+2000*2+5000+10000+20000*2+50000+100000)*1e10,
		is_private: true,
		is_transferrable: true,
		auto_destroy: false,
		fixed_denominations: true,
		issued_by_definer_only: true,
		cosigned_by_definer: false,
		spender_attested: false,
		denominations: [
			{denomination: 1, count_coins: 1e10},
			{denomination: 2, count_coins: 2e10},
			{denomination: 5, count_coins: 1e10},
			{denomination: 10, count_coins: 1e10},
			{denomination: 20, count_coins: 2e10},
			{denomination: 50, count_coins: 1e10},
			{denomination: 100, count_coins: 1e10},
			{denomination: 200, count_coins: 2e10},
			{denomination: 500, count_coins: 1e10},
			{denomination: 1000, count_coins: 1e10},
			{denomination: 2000, count_coins: 2e10},
			{denomination: 5000, count_coins: 1e10},
			{denomination: 10000, count_coins: 1e10},
			{denomination: 20000, count_coins: 2e10},
			{denomination: 50000, count_coins: 1e10},
			{denomination: 100000, count_coins: 1e10}
		]
	};
	composer.composeAssetDefinitionJoint(genesis_address, asset, signer, callbacks);
}

eventBus.once('headless_wallet_ready', function() {
    loadWalletConfig(function() {
        createBlackbytes(function(assetHash) {
            console.log("Blackbytes asset created: " + assetHash);
            //process.exit(0);
        });
    });
});

