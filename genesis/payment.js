/*jslint node: true */
"use strict";
const fs = require('fs');
const headlessWallet = require('headless-byteball/start.js');
const eventBus = require('byteballcore/event_bus.js');

const configPath = "../wallets/";
const payingConfigFile = configPath+"paying-config.json";
const payeeConfigFile = configPath+"payee-config.json";
let paying_address;
let payee_address;

function onError(err){
	throw Error(err);
}

function loadWalletConfig(onDone) {
	let data = fs.readFileSync(payingConfigFile, 'utf8');
	let wallet = JSON.parse(data);
    paying_address = wallet['address'];

	data = fs.readFileSync(payeeConfigFile, 'utf8');
	wallet = JSON.parse(data);
	payee_address = wallet['address'];

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
		{address: paying_address, amount: 0},      // the change
		{address: payee_address, amount: 100}  // the receiver
	];
	composer.composePaymentJoint([paying_address], arrOutputs, headlessWallet.signer, callbacks);
}

eventBus.on('headless_wallet_ready', function() {
	console.log("> Create payment");
    loadWalletConfig(function() {
		setInterval(createPayment, 1000*30);
	});
});
