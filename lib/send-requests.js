var HttpStatus = require('http-status-codes');

/**
 * Send requests sequentially and handle limit rate.
 * @param {Object[]} requests
 * @param {string} requests[].url
 * @param {Object} requests[].data The request parameters
 * 
 * @module
 */
module.exports = function sendRequests(rcPlatform, requests, eachSentCb, allSenctCb) {
	if (requests.length < 1) {
		allSenctCb && allSenctCb();
		return;
	}
	var req = requests[0];
	rcPlatform.post(req.url, req.data).then(function() {
		eachSentCb && eachSentCb();
		sendRequests(rcPlatform, requests.slice(1), eachSentCb, allSenctCb);
	}).catch(function(e) {
		var res = e.apiResponse.response();
		if (res.status = HttpStatus.TOO_MANY_REQUESTS) {
			var retryAfter = parseInt(res.headers.get('retry-after')) ||
				parseInt(res.headers.get('x-rate-limit-window')) ||
				10 * 100;
			console.warn('Rate limit reached, will retry after ' + retryAfter + ' seconds.');
			setTimeout(sendRequests, retryAfter * 1000, rcPlatform, requests, eachSentCb, allSenctCb);
		} else {
			eachSentCb && eachSentCb(e);
		}
	});
}