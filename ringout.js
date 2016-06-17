try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}

var sendRequests = require('./lib/send-requests.js');
var ringout = require('./lib/ringout.js');
var authConf = require('./conf/auth.json');
var ringConf = require('./conf/ringout.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(startRingout).catch(function(e) {
	console.error('Fail to login:' + e);
});


var sentCount = 0;
var repeated = 0;
function startRingout() {
	ringout(ringConf.params, rcPlatform).then(function(theRingout) {
		console.log('ringout result', theRingout);
	}).catch(function (err) {
		console.error('ringout error', err);
	});
}
