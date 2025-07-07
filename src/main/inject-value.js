/*global chrome*/
const executeRequest = require('../lib/inject-value-to-active-element'),
	listener = function (request /*, sender, sendResponse */) {
		'use strict';
		executeRequest(request);
		// Do not remove the listener so it works for every message
	};
chrome.runtime.onMessage.addListener(listener);
