const getRequestValue = require('./get-request-value');

module.exports = function pasteRequestHandler(browserInterface, tabId, request) {
	'use strict';
	// First, copy the value to clipboard via the content script (optional, for legacy support)
	const value = getRequestValue(request);
	browserInterface.copyToClipboard(value);
	// Then, send a message to the content script to trigger paste logic with the value
	return browserInterface.sendMessage(tabId, { action: 'pasteToActiveElement', value });
};
