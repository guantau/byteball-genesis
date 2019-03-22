/*jslint node: true */
"use strict";

let fs = require('fs');
let crypto = require('crypto');
let Mnemonic = require('bitcore-mnemonic');
let Bitcore = require('bitcore-lib');
let objectHash = require('ocore/object_hash');
let constants = require('ocore/constants');
let ecdsa = require('secp256k1');

// create 2 types of config files in configPath
// witness: wallet-witness1~12, witness-config.json
// genesis: wallet-genesis, genesis-config.json
let witnessConfigArray = [];
let witnessAddressArray = [];
const configPath = "../wallets/";


function onError(err) {
	if (err) {
		throw Error(err);
	}
}


function derivePubkey(xPubKey, path) {
	let hdPubKey = new Bitcore.HDPublicKey(xPubKey);
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
	let deviceTempPrivKey = crypto.randomBytes(32);
	let devicePrevTempPrivKey = crypto.randomBytes(32);
	let passphrase = "";
	let mnemonic = new Mnemonic(); // generates new mnemonic
	while (!Mnemonic.isValid(mnemonic.toString()))
		mnemonic = new Mnemonic();
	let xPrivKey = mnemonic.toHDPrivateKey(passphrase);
	let strXPubKey = Bitcore.HDPublicKey(xPrivKey.derive("m/44'/0'/0'")).toString();
	let pubkey = derivePubkey(strXPubKey, "m/"+0+"/"+0);
	let arrDefinition = ['sig', {pubkey: pubkey}];
	let address = objectHash.getChash160(arrDefinition);
	let wallet = crypto.createHash("sha256").update(strXPubKey, "utf8").digest("base64");
	
	let devicePrivKey = xPrivKey.derive("m/1'").privateKey.bn.toBuffer({size:32});
	let devicePubkey = ecdsa.publicKeyCreate(devicePrivKey, true).toString('base64');
	let device_address = objectHash.getDeviceAddress(devicePubkey);

	let obj = {};
	obj['passphrase'] = passphrase;
    obj['mnemonic_phrase'] = mnemonic.phrase;
    obj['temp_priv_key'] = deviceTempPrivKey.toString('base64');
	obj['prev_temp_priv_key'] = devicePrevTempPrivKey.toString('base64');
	obj['device_address'] = device_address;
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
	let wallet = createWallet();
	if (isWitness) {
		witnessConfigArray.push(wallet);
	}

	// create directory
	let dir = configPath+deviceName;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// write keys
	let keys = {};
	keys['mnemonic_phrase'] = wallet['mnemonic_phrase'];
	keys['temp_priv_key'] = wallet['temp_priv_key'];
	keys['prev_temp_priv_key'] = wallet['prev_temp_priv_key'];
	fs.writeFile(dir+"/keys.json", JSON.stringify(keys, null, '\t'), 'utf8', onError);

	// write devicename
	let cfg = {};
	cfg['deviceName'] = deviceName;
	fs.writeFile(dir+"/conf.json", JSON.stringify(cfg, null, '\t'), 'utf8', onError);

	return wallet;
}

// create config files for witnesses
console.log("> Create wallets for witness...");
for (let i = 0; i < constants.COUNT_WITNESSES; i++) {
	let wallet = createConfig("wallet-witness"+(i+1), 1);
	witnessAddressArray.push(wallet['address']);
}
fs.writeFile(configPath+"witness-config.json", JSON.stringify(witnessConfigArray, null, '\t'), 'utf8', onError);
fs.writeFile(configPath+"witness-address.json", JSON.stringify(witnessAddressArray.sort(), null, '\t'), 'utf8', onError);
console.log(witnessAddressArray.sort());

// create config files for genesis address
console.log("> Create wallets for genesis...");
let wallet = createConfig("wallet-genesis", 0);
fs.writeFile(configPath+"genesis-config.json", JSON.stringify(wallet, null, '\t'), 'utf8', onError);

console.log("Done!");
