const getRequestValue = require('./get-request-value');
module.exports = function copyRequestHandler(browserInterface, tabId, request) {
	'use strict';
	// Just send a message to the content script to copy the value to clipboard
	browserInterface.copyToClipboard(getRequestValue(request));
};
