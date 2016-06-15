try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}

var sendRequests = require('./lib/send-requests.js');
var FormData = require('form-data');
var fs = require('fs');
var authConf = require('./conf/auth.json');
var faxConf = require('./conf/fax.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(sendfax).catch(function(e) {
	console.error('Fail to login:' + e);
});

var sentCount = 0;
var repeated = 0;

function sendfax() {
	var form = new FormData();
	form.append('json', new Buffer(JSON.stringify(faxConf.params)), {
		filename: 'request.json',
		contentType: 'application/json'
	});

	var text = faxConf.text.replace('{signature}', 'to ' + fmtPhoneNumbers(faxConf.params.to) + '. Time:' + new Date() + '. #' + repeated);
	form.append('attachment', new Buffer(text), {
		filename: 'text.txt'
	});

	for (var i = 0; i < faxConf.files.length; i++) {
		form.append('attachment', fs.createReadStream(faxConf.files[i]));
	}

	sendRequests(rcPlatform, [{
		url: '/account/~/extension/~/fax',
		data: form
	}], function function_name(err) {
		if (!err) {
			sentCount++;
			console.log(sentCount + ' faxes sent.');
		} else {
			console.error('Send fax error:' + err);
		}
	}, function() {
		repeated++;
		var repeat = faxConf.count || 1;
		if (repeated < repeat || repeat == -1) {
			sendfax();
		}
	});
}

function fmtPhoneNumbers(phones) {
	return phones.map(function(p) {
		return p.phoneNumber;
	}).join(',');
}