/*jslint node: true */
"use strict";

exports.port = null;
//exports.myUrl = 'wss://mydomain.com/bb';
exports.bServeAsHub = false;
exports.bLight = false;

exports.storage = 'sqlite';
exports.admin_email='witness';
exports.from_email='witness';
exports.WS_PROTOCOL = 'ws://';
exports.hub = '127.0.0.1:6611';
exports.deviceName = 'Witness';
exports.permanent_pairing_secret = 'randomstring';
exports.control_addresses = ['DEVICE ALLOWED TO CHAT'];
exports.payout_address = 'WHERE THE MONEY CAN BE SENT TO';

exports.bSingleAddress = true;
exports.THRESHOLD_DISTANCE = 10;
exports.MIN_INTERVAL = 60*1000; // min interval between witnessings in milliseconds
exports.MIN_AVAILABLE_WITNESSINGS = 100;

exports.KEYS_FILENAME = 'keys.json';

console.log('finished witness conf');
