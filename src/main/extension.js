/*global chrome, browser*/
const ContextMenu = require('../lib/context-menu'),
	ChromeMenuBuilder = require('../lib/chrome-menu-builder'),
	ChromeBrowserInterface = require('../lib/chrome-browser-interface'),
	processMenuObject = require('../lib/process-menu-object'),
	standardConfig = require('../../template/config.json'),
	isFirefox = (typeof browser !== 'undefined');

function createContextMenus() {
	'use strict';
	const contextMenu = new ContextMenu(
		standardConfig,
		new ChromeBrowserInterface(chrome),
		new ChromeMenuBuilder(chrome),
		processMenuObject,
		true
	);
	return contextMenu.init();
}

let isRebuildingMenus = false;
let rebuildQueued = false;
function resetAndCreateContextMenus() {
	'use strict';
	if (isRebuildingMenus) {
		rebuildQueued = true;
		return;
	}
	isRebuildingMenus = true;
	chrome.contextMenus.removeAll(() => {
		Promise.resolve(createContextMenus())
			.catch(() => {})
			.finally(() => {
				isRebuildingMenus = false;
				if (rebuildQueued) {
					rebuildQueued = false;
					resetAndCreateContextMenus();
				}
			});
	});
}

// Ensure context menus are created on install/update
chrome.runtime.onInstalled.addListener(() => {
	'use strict';
	resetAndCreateContextMenus();
});

// Rebuild menus on browser startup and extension reload
chrome.runtime.onStartup.addListener(() => {
	'use strict';
	resetAndCreateContextMenus();
});

// Fallback: ensure menus exist after loading
resetAndCreateContextMenus();
