/*jslint node: true */
"use strict";
const fs = require('fs');
const headlessWallet = require('headless-obyte/start.js');
const eventBus = require('ocore/event_bus.js');

const configPath = "../wallets/";
const genesisConfigFile = configPath+"genesis-config.json";
let genesis_address;
let receive_address = '635NNZCKJABPMIT6CLWMTLV3VSOFX52V';
let amount = 1;

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
	let composer = require('ocore/composer.js');
	let network = require('ocore/network.js');
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

/* Send only one request, cause next are not accepted unless MC is stable ~7-10 min */
eventBus.on('headless_wallet_ready', function() {
	console.log("> Create payment");
    loadWalletConfig(function() {
		createPayment();
	});
});
