try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}
var HttpStatus = require('http-status-codes')
var authConf = require('./conf/auth.json');
var smsConf = require('./conf/sms.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(composeMessages).then(sendSms).catch(function(e) {
	console.error('Fail to login:' + e);
});

function composeMessages() {
	var messages = [];
	var fromPhones = smsConf.from;
	var repeat = smsConf.count || 1;
	for (var n = 1; n <= repeat; n++) {
		for (var i = 0; i < fromPhones.length; i++) {
			var f = fromPhones[i];
			var signature = 'from ' + phoneNumberFmt(f) + ' to ' + smsConf.to.map(phoneNumberFmt).join(', ') + '. Time:' + new Date() + '. #' + n;
			var params = {
				from: f,
				to: smsConf.to,
				text: smsConf.text.replace('{signature}', signature)
			};
			messages.push(params);
		}
	}
	return messages;
}

var sentCount = 0;

function sendSms(remainingMessages) {
	rcPlatform.post('/account/~/extension/~/sms', remainingMessages[0]).then(function() {
		remainingMessages.shift();
		sentCount++;
		console.log(sentCount + ' sms sent.');
		if (remainingMessages.length > 0) {
			sendSms(remainingMessages);
		}
	}).catch(function(e) {
		var res = e.apiResponse.response();
		if (res.status = HttpStatus.TOO_MANY_REQUESTS) {
			var retryAfter = parseInt(res.headers.get('retry-after'));
			console.warn('Rate limit reached, will retry after ' + retryAfter + ' seconds.');
			setTimeout(sendSms, retryAfter * 1000, remainingMessages);
		} else {
			console.error('Fail to send sms:' + e);
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