try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}
var Handlebars = require('handlebars');
var sendRequests = require('./lib/send-requests.js');
var authConf = require('./conf/auth.json');
var smsConf = require('./conf/sms.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(sendSms).catch(function(e) {
	console.error('Fail to login:', e);
});

var smsTpl = Handlebars.compile(smsConf.text);
var sentCount = 0;
var repeated = 0;

function sendSms() {
	var conf = smsConf;
	var reqs = [];
	var fromPhones = conf.from;
	var toPhones = conf.to;
	for (var i = 0; i < fromPhones.length; i++) {
		for (var j = 0; j < toPhones.length; j++) {
			var f = fromPhones[i];
			var t = toPhones[j];
			var data = {
				from: f.phoneNumber,
				to: t.phoneNumber,
				time: new Date(),
				no: repeated
			}
			var params = {
				from: f,
				to: [t],
				text: smsTpl(data)
			};
			reqs.push({
				url: '/account/~/extension/~/sms',
				data: params
			});
		}

	}
	sendRequests(rcPlatform, reqs, function(err) {
		if (!err) {
			sentCount++;
			console.log(sentCount + ' sms sent.');
		} else {
			console.error('Send sms error:' + err);
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