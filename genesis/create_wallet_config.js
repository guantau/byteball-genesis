/*jslint node: true */
"use strict";

var fs = require('fs');
var crypto = require('crypto');
var Mnemonic = require('bitcore-mnemonic');
var Bitcore = require('bitcore-lib');
var objectHash = require('byteballcore/object_hash');
var constants = require('byteballcore/constants');


// create 4 types of config files in configPath
// witness: wallet-witness1~12, witness-config.json
// genesis: wallet-genesis, genesis-config.json
// paying:  wallet-paying, paying-config.json
// payee:   wallet-payee, payee-config.json
var witnessConfigArray = [];
var witnessAddressArray = [];
const configPath = "../wallets/";


function onError(err) {
	if (err) {
		throw Error(err);
	}
}


function derivePubkey(xPubKey, path) {
	var hdPubKey = new Bitcore.HDPublicKey(xPubKey);
	return hdPubKey.derive(path).publicKey.toBuffer().toString("base64");
}


/**
wallet example:
    "passphrase": "",
    "mnemonic_phrase": "industry expect outer unique utility scan umbrella solid round battle enemy danger",
    "temp_priv_key": "N7JUkRsOaxlUQ+/8IhT+r2e1HHrXI6TrxsaiNBsiCEo=",
    "prev_temp_priv_key": "7spdl99kigmnni1WyTjCMjKQ7ziooaDRFxpO84+LstY=",

    "address": "JDKPTX4UEZ4A6LRYBVYBX3BYIYADDAQS",
    "wallet": "yM2SBBJXEgja7lMMSVuCAqioiGYJ3+GYVO0ZOSOe2CM=",
    "is_change": 0,
    "address_index": 0,
    "definition": ["sig",{"pubkey":"AwnOX+2ycbnzUVPHeMTBQlnqWuMTa9jqNBDLbtT2wOLe"}],
    "creation_date": "2017-10-25 02:17:31"
**/
function createWallet() {
	var deviceTempPrivKey = crypto.randomBytes(32);
	var devicePrevTempPrivKey = crypto.randomBytes(32);
	var passphrase = "";
	var mnemonic = new Mnemonic(); // generates new mnemonic
	while (!Mnemonic.isValid(mnemonic.toString()))
		mnemonic = new Mnemonic();
	var xPrivKey = mnemonic.toHDPrivateKey(passphrase);
	var strXPubKey = Bitcore.HDPublicKey(xPrivKey.derive("m/44'/0'/0'")).toString();
	var pubkey = derivePubkey(strXPubKey, "m/"+0+"/"+0);
	var arrDefinition = ['sig', {pubkey: pubkey}];
	var address = objectHash.getChash160(arrDefinition);
	var wallet = crypto.createHash("sha256").update(strXPubKey, "utf8").digest("base64");

	var obj = {};
	obj['passphrase'] = passphrase;
    obj['mnemonic_phrase'] = mnemonic.phrase;
    obj['temp_priv_key'] = deviceTempPrivKey.toString('base64');
    obj['prev_temp_priv_key'] = devicePrevTempPrivKey.toString('base64');
	obj['address'] = address;
	obj['wallet'] = wallet;
    obj['is_change'] = 0;
    obj['address_index'] = 0;
	obj['definition'] = arrDefinition;

	return obj;
    //console.log(JSON.stringify(obj));
}


// create config files for wallet
function createConfig(deviceName, isWitness) {
	// create the wallet
	var wallet = createWallet();
	if (isWitness) {
		witnessConfigArray.push(wallet);
	}

	// create directory
	var dir = configPath+deviceName;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// write keys
	var keys = {};
	keys['mnemonic_phrase'] = wallet['mnemonic_phrase'];
	keys['temp_priv_key'] = wallet['temp_priv_key'];
	keys['prev_temp_priv_key'] = wallet['prev_temp_priv_key'];
	fs.writeFile(dir+"/keys.json", JSON.stringify(keys, null, '\t'), 'utf8', onError);

	// write devicename
	var cfg = {};
	cfg['deviceName'] = deviceName;
	fs.writeFile(dir+"/conf.json", JSON.stringify(cfg, null, '\t'), 'utf8', onError);

	return wallet;
}

// create config files for witnesses
console.log("> Create wallets for witness...");
for (let i = 0; i < constants.COUNT_WITNESSES; i++) {
	wallet = createConfig("wallet-witness"+(i+1), 1);
	witnessAddressArray.push(wallet['address']);
}
fs.writeFile(configPath+"witness-config.json", JSON.stringify(witnessConfigArray, null, '\t'), 'utf8', onError);
fs.writeFile(configPath+"witness-address.json", JSON.stringify(witnessAddressArray.sort(), null, '\t'), 'utf8', onError);
console.log(witnessAddressArray.sort());

// create config files for change address
console.log("> Create wallets for change...");
var wallet = createConfig("wallet-genesis", 0);
fs.writeFile(configPath+"genesis-config.json", JSON.stringify(wallet, null, '\t'), 'utf8', onError);

// create config files for paying address
console.log("> Create wallets for paying...");
wallet = createConfig("wallet-paying", 0);
fs.writeFile(configPath+"paying-config.json", JSON.stringify(wallet, null, '\t'), 'utf8', onError);

// create config files for payee address
console.log("> Create wallets for payee...");
wallet = createConfig("wallet-payee", 0);
fs.writeFile(configPath+"payee-config.json", JSON.stringify(wallet, null, '\t'), 'utf8', onError);

console.log("Done!");
