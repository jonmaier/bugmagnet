module.exports = function injectValueRequestHandler(browserInterface, tabId, requestValue) {
	'use strict';
	return browserInterface.sendMessage(tabId, Object.assign({ action: 'injectValue' }, requestValue));
};
