try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}

var sendRequests = require('./lib/send-requests.js');
var authConf = require('./conf/auth.json');
var pagerConf = require('./conf/pager.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(sendPager).catch(function(e) {
	console.error('Fail to login:' + e);
});

var sentCount = 0;
var repeated = 0;
function sendPager() {
	var reqs = [];
	var fromPhones = pagerConf.from;
	for (var i = 0; i < fromPhones.length; i++) {
			var f = fromPhones[i];
			var signature = 'from ' + phoneNumberFmt(f) + ' to ' + pagerConf.to.map(phoneNumberFmt).join(', ') + '. Time:' + new Date() + '. #' + repeated;
			var params = {
				from: f,
				to: pagerConf.to,
				text: pagerConf.text.replace('{signature}', signature)
			};
			reqs.push({url: '/account/~/extension/~/company-pager', data: params});
	}
	sendRequests(rcPlatform, reqs, function (err) {
		if (!err) {
			sentCount++;
			console.log(sentCount + ' pager messages sent.');
		} else {
			console.error('Send pager message error:'+err);
		}
	}, function() {
		repeated++;
		var repeat = pagerConf.count || 1;
		if (repeated < repeat || repeat == -1) {
			sendPager();
		}
	});
}

function phoneNumberFmt(info) {
	var parts = [];
	info.phoneNumber && parts.push(info.phoneNumber);
	info.extensionNumber && parts.push(info.extensionNumber);
	return parts.join(',');
}