try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}

var sendRequests = require('./lib/send-requests.js');
var authConf = require('./conf/auth.json');
var smsConf = require('./conf/sms.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(sendSms).catch(function(e) {
	console.error('Fail to login:' + e);
});

var sentCount = 0;
var repeated = 0;
function sendSms() {
	var reqs = [];
	var fromPhones = smsConf.from;
	for (var i = 0; i < fromPhones.length; i++) {
			var f = fromPhones[i];
			var signature = 'from ' + phoneNumberFmt(f) + ' to ' + smsConf.to.map(phoneNumberFmt).join(', ') + '. Time:' + new Date() + '. #' + repeated;
			var params = {
				from: f,
				to: smsConf.to,
				text: smsConf.text.replace('{signature}', signature)
			};
			reqs.push({url: '/account/~/extension/~/sms', data: params});
	}
	sendRequests(rcPlatform, reqs, function (err) {
		if (!err) {
			sentCount++;
			console.log(sentCount + ' sms sent.');
		} else {
			console.error('Send sms error:'+err);
		}
	}, function() {
		repeated++;
		var repeat = smsConf.count || 1;
		if (repeated < repeat || repeat == -1) {
			sendSms();
		}
	});
}

function phoneNumberFmt(info) {
	var str = info.phoneNumber;
	if (info.extensionNumber) {
		str += ',' + info.extensionNumber;
	}
	return str;
}