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

rcPlatform.login(authConf.user).then(makeRingoutsRepeatedly).catch(function(e) {
	console.error('Fail to login:' + e);
});


var repeated = 0;

function makeRingoutsRepeatedly() {
	repeated++;
	var repeat = ringConf.count || 1;
	if (repeated > repeat && repeat != -1) {
		return;
	}
	Promise.all(makeRingouts(ringConf.ringouts)).then(makeRingoutsRepeatedly).catch(function() {
		setTimeout(makeRingoutsRepeatedly, 3000);
	});

}

function makeRingouts(ringouts) {
	var results = [];
	for (var i = 0; i < ringouts.length; i++) {
		results.push(ringout(ringouts[i], rcPlatform).then(function(theRingout) {
			console.log('ringout result', theRingout);
			return theRingout;
		}).catch(function(e) {
			console.error('ringout error ' + e);
		}));
	}
	return results;
}