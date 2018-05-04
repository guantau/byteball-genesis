/*jslint node: true */
"use strict";

exports.clientName = 'byteball';
exports.minClientVersion = '2.1.0';

// https://console.developers.google.com
exports.pushApiProjectNumber = 0;
exports.pushApiKey = '';

exports.port = 6611;
//exports.myUrl = 'wss://mydomain.com/bb';
exports.bServeAsHub = true;
exports.bSaveJointJson = true;
exports.bLight = false;

// this is used by wallet vendor only, to redirect bug reports to developers' email
exports.bug_sink_email = 'admin@example.org';
exports.bugs_from_email = 'bugs@example.org';

exports.HEARTBEAT_TIMEOUT = 300*1000;

exports.storage = 'sqlite';


exports.initial_witnesses = [
    '4POPAXQLACF6UOPBJMB4LZ5IKZPAC2BE',
    'DCB5B2PI4SVLTMMTOC2XWGQ4GUEENWKI',
    'DE4ABLNVUM4KQVT6RQHA7OP5GQFXVZBH',
    'EO557VKFOJERPHI45SJIN2K5LRIZMOO6',
    'EVXOERRAWLRBQSHFNWU4AFGHEBVEJRR5',
    'HWDZNEIOFJVCANY7G7EZ7O5EFWEUQQQD',
    'JXYEK66S3NJJ7I6SOBQ575J344ONCEXF',
    'OBXJOOOXPS2Z3VFOTG7CT67MHDHNDTMY',
    'REWI6I5TDFL5CP7OF5YZMMXJMGS3ALYE',
    'SPN477MRYL2PHMHZSJ7PTQB5N32GEN75',
    'V2SCV67S3NQQ3A2E2WGZPSKSF4CSYB22',
    'Y2STVV5JUS4RG5RRDOG3YJLVR7OWMR3L'
];

/* new testnet
exports.initial_witnesses = [
	'2FF7PSL7FYXVU5UIQHCVDTTPUOOG75GX',
	'2GPBEZTAXKWEXMWCTGZALIZDNWS5B3V7',
	'4H2AMKF6YO2IWJ5MYWJS3N7Y2YU2T4Z5',
	'DFVODTYGTS3ILVOQ5MFKJIERH6LGKELP',
	'ERMF7V2RLCPABMX5AMNGUQBAH4CD5TK4',
	'F4KHJUCLJKY4JV7M5F754LAJX4EB7M4N',
	'IOF6PTBDTLSTBS5NWHUSD7I2NHK3BQ2T',
	'O4K4QILG6VPGTYLRAI2RGYRFJZ7N2Q2O',
	'OPNUXBRSSQQGHKQNEPD2GLWQYEUY5XLD',
	'PA4QK46276MJJD5DBOLIBMYKNNXMUVDP',
	'RJDYXC4YQ4AZKFYTJVCR5GQJF5J6KPRI',
	'WELOXP3EOA75JWNO6S5ZJHOO3EYFKPIR'
];
*/

exports.initial_peers = [
];

/*
exports.trustedRegistries = {
	'AM6GTUKENBYA54FYDAKX2VLENFZIMXWG': 'market'
};
*/

console.log('finished hub conf');
