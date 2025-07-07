const triggerEvents = require('../lib/trigger-events');

// eslint-disable-next-line strict
function pasteToActiveElement(value) {
	let el = document.activeElement;
	if (!el) {
		return;
	}
	while (el.contentDocument) {
		el = el.contentDocument.activeElement;
	}
	if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
		el.value = value;
		triggerEvents(el, ['input', 'change']);
	} else if (el.hasAttribute && el.hasAttribute('contenteditable')) {
		el.innerText = value;
	}
}

chrome.runtime.onMessage.addListener(function (request) {
	if (request && request.action === 'pasteToActiveElement') {
		if (request.value) {
			pasteToActiveElement(request.value);
		}
	}
	if (request && request.action === 'copyToClipboard') {
		if (request.value) {
			const handler = function (e) {
				e.clipboardData.setData('text/plain', request.value);
				e.preventDefault();
			};
			document.addEventListener('copy', handler);
			document.execCommand('copy');
			document.removeEventListener('copy', handler);
		}
	}
});
