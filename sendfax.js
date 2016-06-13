try {
	var Ringcentral = require('ringcentral');
} catch (e) {
	console.error('Please run `npm install` first.');
	return;
}
var FormData = require('form-data');
var fs = require('fs');
var authConf = require('./conf/auth.json');
var faxConf = require('./conf/fax.json');

var ringcentral = new Ringcentral(authConf.app);

var rcPlatform = ringcentral.platform();

rcPlatform.login(authConf.user).then(sendfax).catch(function(e) {
	console.error('Fail to login:' + e);
});

function sendfax() {
	var sentCount = 0;
	var repeat = faxConf.count || 1;
	for (var n = 1; n <= repeat; n++) {
		var form = new FormData();
		form.append('json', new Buffer(JSON.stringify(faxConf.params)), {
			filename: 'request.json',
			contentType: 'application/json'
		});

		var text = faxConf.text.replace('{signature}', 'to ' + fmtPhoneNumbers(faxConf.params.to) + '. Time:' + new Date() + '. #' + n);
		form.append('attachment', new Buffer(text), {
			filename: 'text.txt'
		});

		for (var i = 0; i < faxConf.files.length; i++) {
			form.append('attachment', fs.createReadStream(faxConf.files[i]));
		}

		rcPlatform.post('/account/~/extension/~/fax', form).then(function() {
			sentCount++;
			console.log(sentCount + ' faxes sent.');
		}).catch(function(e) {
			console.error('Fail to send fax:' + e);
		});

	}
}

function fmtPhoneNumbers(phones) {
	return phones.map(function(p) {
		return p.phoneNumber;
	}).join(',');
}