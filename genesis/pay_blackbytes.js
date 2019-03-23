/*jslint node: true */
"use strict";
const fs = require('fs');
const eventBus = require('ocore/event_bus.js');
const headlessWallet = require('headless-obyte/start.js');
const constants = require('ocore/constants.js');


const configPath = "../wallets/";
const genesisConfigFile = configPath+"genesis-config.json";
let genesis_address;
let receive_address = '';
let receive_device = '';
let amount = 10000;


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
    onDone();
}


function createBlackBytesPayment(){
	var network = require('ocore/network.js');
	var indivisibleAsset = require('ocore/indivisible_asset.js');
	var walletGeneral = require('ocore/wallet_general.js');
	
	indivisibleAsset.composeAndSaveIndivisibleAssetPaymentJoint({
		asset: constants.BLACKBYTES_ASSET, 
		paying_addresses: [genesis_address],
		fee_paying_addresses: [genesis_address],
		change_address: genesis_address,
		to_address: receive_address,
		amount: amount, 
		tolerance_plus: 0, 
		tolerance_minus: 0, 
		signer: headlessWallet.signer, 
		callbacks: {
			ifError: onError,
			ifNotEnoughFunds: onError,
			ifOk: function(objJoint, arrRecipientChains, arrCosignerChains){
				network.broadcastJoint(objJoint);
				if (arrRecipientChains){ // if the asset is private
					// send directly to the receiver
					//network.sendPrivatePayment('wss://example.org/bb', arrRecipientChains);
					
					// or send to the receiver's device address through the receiver's hub
					walletGeneral.sendPrivatePayments(receive_device, arrRecipientChains);
				}
			}
		}
	});
}

eventBus.once('headless_wallet_ready', function() {
	console.log("> Create blackbytes payment");
    loadWalletConfig(function() {
        createBlackBytesPayment();
    });
});

