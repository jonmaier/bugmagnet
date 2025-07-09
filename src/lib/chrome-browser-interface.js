module.exports = function ChromeBrowserInterface(chrome) {
	'use strict';
	const self = this;
	self.saveOptions = function (options) {
		chrome.storage.sync.set(options);
	};
	self.getOptionsAsync = function () {
		return new Promise((resolve) => {
			chrome.storage.sync.get(null, resolve);
		});
	};
	self.openSettings = function () {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	};
	self.openUrl = function (url) {
		window.open(url);
	};
	self.addStorageListener = function (listener) {
		chrome.storage.onChanged.addListener(function (changes, areaName) {
			if (areaName === 'sync') {
				listener(changes);
			}
		});
	};
	self.getRemoteFile = function (url) {
		return fetch(url, {mode: 'cors'}).then(function (response) {
			if (response.ok) {
				return response.text();
			}
			throw new Error('Network error reading the remote URL');
		});
	};
	self.closeWindow = function () {
		window.close();
	};
	self.readFile = function (fileInfo) {
		return new Promise((resolve, reject) => {
			const oFReader = new FileReader();
			oFReader.onload = function (oFREvent) {
				try {
					resolve(oFREvent.target.result);
				} catch (e) {
					reject(e);
				}
			};
			oFReader.onerror = reject;
			oFReader.readAsText(fileInfo, 'UTF-8');
		});
	};
	self.executeScript = function (tabId, source) {
		// Manifest V3: use chrome.scripting.executeScript
		return chrome.scripting.executeScript({
			target: {tabId: tabId},
			files: [source.replace(/^\//, '')] // remove leading slash if present
		});
	};
	self.sendMessage = function (tabId, message) {
		return new Promise((resolve) => {
			try {
				console.log('[BugMagnet] Attempting to send message to tab', tabId, message);
				chrome.tabs.get(tabId, function (tab) {
					if (!tab || !tab.url ||
						tab.url.startsWith('chrome://') ||
						tab.url.startsWith('chrome-extension://') ||
						tab.url.startsWith('chromewebstore://')) {
						console.warn('[BugMagnet] Tab is restricted or not found:', tab);
						resolve(null);
						return;
					}
					// Try sending the message first
					chrome.tabs.sendMessage(tabId, message, function (response) {
						if (chrome.runtime.lastError) {
							console.warn('[BugMagnet] Message failed, attempting to inject content script:', chrome.runtime.lastError.message);
							chrome.scripting.executeScript({
								target: {tabId: tabId},
								files: ['content-actions.js']
							}, function (results) {
								console.log('[BugMagnet] Content script injected, retrying message', results);
								// Retry sending the message after injection
								chrome.tabs.sendMessage(tabId, message, function (response2) {
									if (chrome.runtime.lastError) {
										console.error('[BugMagnet] Message failed after injection:', chrome.runtime.lastError.message);
										resolve(null);
									} else {
										console.log('[BugMagnet] Message succeeded after injection', response2);
										resolve(response2);
									}
								});
							});
						} else {
							console.log('[BugMagnet] Message sent successfully', response);
							resolve(response);
						}
					});
				});
			} catch (e) {
				console.error('[BugMagnet] Exception in sendMessage:', e);
				resolve(null);
			}
		});
	};

	self.requestPermissions = function (permissionsArray) {
		return new Promise((resolve, reject) => {
			try {
				chrome.permissions.request({permissions: permissionsArray}, function (granted) {
					if (granted) {
						resolve();
					} else {
						reject();
					}
				});
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	};
	self.removePermissions = function (permissionsArray) {
		return new Promise((resolve) => chrome.permissions.remove({permissions: permissionsArray}, resolve));
	};
	self.copyToClipboard = function (text) {
		// Manifest V3: send a message to the content script to perform the copy
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			if (tabs[0]) {
				chrome.tabs.sendMessage(tabs[0].id, {action: 'copyToClipboard', value: text}, function () {
					if (chrome.runtime.lastError) {
						console.warn('Content script not found in tab', tabs[0].id, chrome.runtime.lastError.message);
					}
				});
			}
		});
	};
	self.showMessage = function (text) {
		// Manifest V3: use chrome.scripting.executeScript
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			if (tabs[0]) {
				chrome.scripting.executeScript({
					target: {tabId: tabs[0].id},
					func: function (msg) {
						alert(msg);
					},
					args: [text]
				});
			}
		});
	};
};
