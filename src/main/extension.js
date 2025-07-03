/*global chrome, browser*/
const ContextMenu = require('../lib/context-menu'),
	ChromeMenuBuilder = require('../lib/chrome-menu-builder'),
	ChromeBrowserInterface = require('../lib/chrome-browser-interface'),
	processMenuObject = require('../lib/process-menu-object'),
	standardConfig = require('../../template/config.json'),
	isFirefox = (typeof browser !== 'undefined'),
	browserInterface = new ChromeBrowserInterface(chrome);

function initMenus() {
	'use strict';
	new ContextMenu(
		standardConfig,
		browserInterface,
		new ChromeMenuBuilder(chrome),
		processMenuObject,
		!isFirefox
	).init();
}

chrome.runtime.onInstalled.addListener(initMenus);
chrome.runtime.onStartup.addListener(initMenus);

initMenus();

