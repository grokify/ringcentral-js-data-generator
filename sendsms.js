var Ringcentral = require('ringcentral');
var authConf = require('./conf/auth.json');
var smsConf = require('./conf/sms.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(sendSms).catch(function(e) {
	console.error('Fail to login', e);
});

function sendSms() {
	var sentCount = 0;
	var fromPhones = smsConf.from;
	for (var n = 1; n <= smsConf.count; n++) {
		for (var i = 0; i < fromPhones.length; i++) {
			var f = fromPhones[i];
			var signature = 'from ' + phoneNumberFmt(f) + ' to ' + smsConf.to.map(phoneNumberFmt).join(', ') + '. Time:' + new Date() + '. #' + n;
			var params = {
				from: f,
				to: smsConf.to,
				text: smsConf.text.replace('{signature}', signature)
			};
			rcPlatform.post('/account/~/extension/~/sms', params).then(function() {
				sentCount++;
				console.log(sentCount + ' sms sent.');
			}).catch(function(e) {
				console.error('Fail to send sms:' + e);
			});
		}
	}
}

function phoneNumberFmt(info) {
	var str = info.phoneNumber;
	if (info.extensionNumber) {
		str += ',' + info.extensionNumber;
	}
	return str;
}