/* global chrome */
(function () {
	'use strict';
	const triggerEvents = require('../lib/trigger-events');
	const executeRequest = require('../lib/inject-value-to-active-element'),
		ENABLE_BUGMAGNET_LOGGING = false;

	function bugMagnetLog(...args) {
		if (ENABLE_BUGMAGNET_LOGGING) {
			console.log('[BugMagnet] ', ...args);
		}
	}

	bugMagnetLog('Content script loaded');

	function highlightElement(el) {
		if (!el) {
			return;
		}
		const prevOutline = el.style.outline;
		el.style.outline = '2px solid #ff9800';
		setTimeout(() => {
			el.style.outline = prevOutline;
		}, 800);
	}

	function pasteToActiveElement(value) {
		let el = document.activeElement;
		if (!el) {
			return;
		}
		while (el.contentDocument) {
			el = el.contentDocument.activeElement;
		}
		if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
			bugMagnetLog('Setting value on input/textarea', el, value);
			el.value = value;
			triggerEvents(el, ['input', 'change']);
			highlightElement(el);
		} else if (el.hasAttribute && el.hasAttribute('contenteditable')) {
			bugMagnetLog('Setting value on contenteditable', el, value);
			el.innerText = value;
			highlightElement(el);
		}
	}

	function copyToClipboard(value) {
		bugMagnetLog('copyToClipboard called with value:', value);
		const handler = function (e) {
			e.clipboardData.setData('text/plain', value);
			e.preventDefault();
		};
		document.addEventListener('copy', handler);
		document.execCommand('copy');
		document.removeEventListener('copy', handler);
	}

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		// Only log when acting on the element
		switch (request.action) {
		case 'injectValue':
			// No extra log here, handled in executeRequest if needed
			executeRequest(request);
			break;
		case 'pasteToActiveElement':
			if (request.value) {
				pasteToActiveElement(request.value);
			}
			break;
		case 'copyToClipboard':
			if (request.value) {
				copyToClipboard(request.value);
			}
			break;
		}
		sendResponse({success: true});
		// If you need to do async work, return true here
	});
}());
