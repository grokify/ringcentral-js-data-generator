var HttpStatus = require('http-status-codes');

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
		if (res.status == HttpStatus.TOO_MANY_REQUESTS) {
			var retryAfter = parseInt(res.headers.get('retry-after')) ||
				parseInt(res.headers.get('x-rate-limit-window')) ||
				10 * 100;
			console.warn('Rate limit reached for checking ringout status, will retry after ' + retryAfter + ' seconds.');
			setTimeout(getRingoutStatus, retryAfter * 1000, ringout, resolve, reject);
		} else {
			reject(e);
		}
	});
}