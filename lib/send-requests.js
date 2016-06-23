var rateLimit = require('./rate-limit.js');

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
		if (rateLimit.reached(res.status)) {
			var retryAfter = rateLimit.getRetryAfter(res.headers);
			console.warn('Rate limit reached, will retry after ' + (retryAfter/1000) + ' seconds.');
			setTimeout(sendRequests, retryAfter, rcPlatform, requests, eachSentCb, allSenctCb);
		} else {
			eachSentCb && eachSentCb(e);
		}
	});
}