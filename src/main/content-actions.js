/* global chrome */
(function () {
	'use strict';
	const triggerEvents = require('../lib/trigger-events');
	const executeRequest = require('../lib/inject-value-to-active-element'),
		ENABLE_BUGMAGNET_LOGGING = false;

	let lastEditableElement = null;

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

	function isEditableElement(el) {
		return !!el && (
			el.tagName === 'TEXTAREA' ||
			el.tagName === 'INPUT' ||
			(el.hasAttribute && el.hasAttribute('contenteditable')) ||
			el.isContentEditable
		);
	}

	function isFrameElement(el) {
		return !!el && el.tagName === 'IFRAME';
	}

	function resolveEditableElement(el) {
		if (!el) {
			return null;
		}
		if (isEditableElement(el) || isFrameElement(el)) {
			return el;
		}
		if (el.querySelector) {
			const descendant = el.querySelector('input, textarea, [contenteditable]');
			if (descendant) {
				return descendant;
			}
		}
		if (el.closest) {
			return el.closest('input, textarea, [contenteditable], iframe');
		}
		return null;
	}

	function getTargetElement() {
		const active = document.activeElement;
		if (isEditableElement(active) || isFrameElement(active)) {
			return active;
		}
		return lastEditableElement;
	}

	function pasteToActiveElement(value, targetElement) {
		let el = targetElement || document.activeElement;
		if (!el) {
			return;
		}
		while (el.contentDocument) {
			el = el.contentDocument.activeElement;
		}
		const dispatchPasteEvent = function (target, text) {
			let clipboardData;
			try {
				clipboardData = new DataTransfer();
				clipboardData.setData('text/plain', text);
			} catch (e) {
				clipboardData = null;
			}
			let pasteEvent;
			try {
				pasteEvent = new ClipboardEvent('paste', {
					clipboardData: clipboardData,
					bubbles: true,
					cancelable: true
				});
			} catch (e) {
				pasteEvent = document.createEvent('Event');
				pasteEvent.initEvent('paste', true, true);
				pasteEvent.clipboardData = clipboardData;
			}
			return target.dispatchEvent(pasteEvent);
		};
		const insertTextIntoInput = function (target, text) {
			if (typeof target.setRangeText === 'function') {
				const start = target.selectionStart || 0;
				const end = target.selectionEnd || 0;
				target.setRangeText(text, start, end, 'end');
				return;
			}
			target.value = text;
		};
		const insertTextIntoContentEditable = function (target, text) {
			try {
				document.execCommand('insertText', false, text);
			} catch (e) {
				target.innerText = text;
			}
		};
		if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
			bugMagnetLog('Setting value on input/textarea', el, value);
			const notPrevented = dispatchPasteEvent(el, value);
			if (notPrevented) {
				insertTextIntoInput(el, value);
				triggerEvents(el, ['input', 'change']);
			}
			highlightElement(el);
		} else if (el.hasAttribute && el.hasAttribute('contenteditable')) {
			bugMagnetLog('Setting value on contenteditable', el, value);
			const notPrevented = dispatchPasteEvent(el, value);
			if (notPrevented) {
				insertTextIntoContentEditable(el, value);
			}
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

	document.addEventListener('contextmenu', (event) => {
		const target = resolveEditableElement(event.target);
		if (target) {
			lastEditableElement = target;
		}
	}, true);

	document.addEventListener('focusin', (event) => {
		const target = resolveEditableElement(event.target);
		if (target) {
			lastEditableElement = target;
		}
	}, true);

	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		// Only log when acting on the element
		switch (request.action) {
		case 'injectValue':
			// No extra log here, handled in executeRequest if needed
			executeRequest(request, getTargetElement());
			break;
		case 'pasteToActiveElement':
			if (request.value !== null && typeof request.value !== 'undefined') {
				pasteToActiveElement(request.value, getTargetElement());
			}
			break;
		case 'copyToClipboard':
			if (request.value !== null && typeof request.value !== 'undefined') {
				copyToClipboard(request.value);
			}
			break;
		}
		sendResponse({success: true});
		// If you need to do async work, return true here
	});
}());
