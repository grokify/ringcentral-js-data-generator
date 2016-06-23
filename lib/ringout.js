var rateLimit = require('./rate-limit.js');

/**
 * https://developer.ringcentral.com/api-docs/latest/index.html#!#RefRingOutCall.html
 */
module.exports = function ringout(params, rcPlatform) {
	platform = rcPlatform;
	return platform.post('/account/~/extension/~/ringout', params).then(checkRingoutStatus);
}

var platform;

function checkRingoutStatus(res) {
	var ringout = res.json();
	if (ringout.status.callStatus != 'InProgress') {
		//console.log('Call result', ringout, 'last', Date.now() - startTime);
		return ringout;
	}

	return new Promise(function(resolve, reject) {
		setTimeout(getRingoutStatus, 1000, ringout, resolve, reject);
	}).then(checkRingoutStatus);
}

function getRingoutStatus(ringout, resolve, reject) {
	platform.get(ringout.uri).then(resolve).catch(function(e) {
		var res = e.apiResponse.response();
		if (rateLimit.reached(res.status)) {
			var retryAfter = rateLimit.getRetryAfter(res.headers);
			console.warn('Rate limit reached for checking ringout status, will retry after ' + (retryAfter/1000) + ' seconds.');
			setTimeout(getRingoutStatus, retryAfter, ringout, resolve, reject);
		} else {
			reject(e);
		}
	});
}