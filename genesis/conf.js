/*jslint node: true */
"use strict";

//exports.port = 6655;
//exports.myUrl = 'wss://mydomain.com/bb';
exports.bServeAsHub = false;
exports.bLight = false;
exports.database = {};
//exports.storage = 'mysql';
exports.WS_PROTOCOL = 'ws://';
exports.hub = '127.0.0.1:6611';
exports.KEYS_FILENAME = 'keys.json';

exports.storage = 'sqlite';
exports.deviceName = 'Headless';
exports.permanent_pairing_secret = 'randomstring';
exports.control_addresses = ['DEVICE ALLOWED TO CHAT'];
exports.payout_address = 'WHERE THE MONEY CAN BE SENT TO';
exports.KEYS_FILENAME = 'keys.json';

// this is for runnining RPC service only, see play/rpc_service.js
exports.rpcInterface = '127.0.0.1';
exports.rpcPort = '6552';

// witness configuration

exports.admin_email='witness';
exports.from_email='witness';

console.log('finished headless conf');
