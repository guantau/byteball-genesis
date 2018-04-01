/*jslint node: true */
"use strict";
const fs = require('fs');
var headlessWallet = require('headless-byteball/start.js');
var eventBus = require('byteballcore/event_bus.js');

const configPath = "../wallets/";
const payingConfigFile = configPath+"paying-config.json";
const payeeConfigFile = configPath+"payee-config.json";
var paying_address;
var payee_address;

function onError(err){
	throw Error(err);
}

function loadWalletConfig(onDone) {
	var data = fs.readFileSync(payingConfigFile, 'utf8');
	var wallet = JSON.parse(data);
	paying_address = wallet['address'];

	data = fs.readFileSync(payeeConfigFile, 'utf8');
	wallet = JSON.parse(data);
	payee_address = wallet['address'];

	onDone();
}

function createPayment() {
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
