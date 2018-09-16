/*jslint node: true */
"use strict";
const fs = require('fs');
const headlessWallet = require('headless-byteball/start.js');
const eventBus = require('byteballcore/event_bus.js');

const configPath = "../wallets/";
const genesisConfigFile = configPath+"genesis-config.json";
let genesis_address;
let receive_address = '4F3VQW2QFFUIC26W57UGJFQD2HPXQVZ6';
let amount = 10000;

function onError(err){
	throw Error(err);
}

function loadWalletConfig(onDone) {
	let data = fs.readFileSync(genesisConfigFile, 'utf8');
	let wallet = JSON.parse(data);
    genesis_address = wallet['address'];

	onDone();
}

function createPayment() {
	let composer = require('byteballcore/composer.js');
	let network = require('byteballcore/network.js');
	let callbacks = composer.getSavingCallbacks({
		ifNotEnoughFunds: onError,
		ifError: onError,
		ifOk: function(objJoint){
			network.broadcastJoint(objJoint);
		}
	});

	let arrOutputs = [
		{address: genesis_address, amount: 0},      // the change
		{address: receive_address, amount: amount}  // the receiver
	];
	composer.composePaymentJoint([genesis_address], arrOutputs, headlessWallet.signer, callbacks);
}

eventBus.on('headless_wallet_ready', function() {
	console.log("> Create payment");
    loadWalletConfig(function() {
		setInterval(createPayment, 1000*30);
	});
});
