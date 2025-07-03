export default function ChromeMenuBuilder(chrome) {
	'use strict';
	let itemValues = {},
		itemHandlers = {};
	const self = this,
		contexts = ['editable'];
	self.rootMenu = function (title) {
		return chrome.contextMenus.create({ 'id': 'rootMenu', 'title': title, 'contexts': contexts });
	};
	self.subMenu = function (title, parentMenu) {
		return chrome.contextMenus.create({ 'id': `subMenu-${title}`, 'title': title, 'parentId': parentMenu, 'contexts': contexts });
	};
	self.separator = function (parentMenu) {
		return chrome.contextMenus.create({ 'id': `separator-${parentMenu}`, 'type': 'separator', 'parentId': parentMenu, 'contexts': contexts });
	};
	self.menuItem = function (title, parentMenu, clickHandler, value) {
		const id = `menuItem-${title}`;
		chrome.contextMenus.create({ 'id': id, 'title': title, 'parentId': parentMenu, 'contexts': contexts });
		itemValues[id] = value;
		itemHandlers[id] = clickHandler;
		return id;
	};
	self.choice = function (title, parentMenu, clickHandler, value) {
		const id = `choice-${title}`;
		chrome.contextMenus.create({ 'id': id, 'type': 'radio', 'checked': value, 'title': title, 'parentId': parentMenu, 'contexts': contexts });
		itemHandlers[id] = clickHandler;
		return id;
	};
	self.removeAll = function () {
		itemValues = {};
		itemHandlers = {};
		return new Promise(resolve => chrome.contextMenus.removeAll(resolve));
	};
	chrome.contextMenus.onClicked.addListener((info, tab) => {
		const itemId = info && info.menuItemId;
		if (itemHandlers[itemId]) {
			itemHandlers[itemId](tab.id, itemValues[itemId]);
		}
	});
	self.selectChoice = function (menuId) {
		return chrome.contextMenus.update(menuId, { checked: true });
	};
}