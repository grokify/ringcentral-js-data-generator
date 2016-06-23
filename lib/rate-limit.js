var HttpStatus = require('http-status-codes');

exports.reached = function(statusCode) {
	return statusCode == HttpStatus.TOO_MANY_REQUESTS;
};

exports.getRetryAfter = function (headers) {
	return (parseInt(headers.get('retry-after')) ||
				parseInt(headers.get('x-rate-limit-window')) ||
				10) * 1000;
};