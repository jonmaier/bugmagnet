module.exports = function ChromeMenuBuilder(chrome) {
	'use strict';
	let itemValues = {},
		itemHandlers = {},
		menuIdCounter = 0;
	const self = this,
		contexts = ['editable'];

	function getUniqueId(prefix) {
		return `${prefix}_${Date.now()}_${menuIdCounter++}`;
	}

	self.rootMenu = function (title) {
		const id = getUniqueId('root');
		chrome.contextMenus.create({'id': id, 'title': title, 'contexts': contexts});
		return id;
	};
	self.subMenu = function (title, parentMenu) {
		const id = getUniqueId('submenu');
		chrome.contextMenus.create({'id': id, 'title': title, 'parentId': parentMenu, 'contexts': contexts});
		return id;
	};
	self.separator = function (parentMenu) {
		const id = getUniqueId('sep');
		chrome.contextMenus.create({'id': id, 'type': 'separator', 'parentId': parentMenu, 'contexts': contexts});
		return id;
	};
	self.menuItem = function (title, parentMenu, clickHandler, value) {
		const id = getUniqueId('item');
		chrome.contextMenus.create({'id': id, 'title': title, 'parentId': parentMenu, 'contexts': contexts});
		itemValues[id] = value;
		itemHandlers[id] = clickHandler;
		return id;
	};
	self.choice  = function (title, parentMenu, clickHandler, value) {
		const id = getUniqueId('choice');
		chrome.contextMenus.create({id: id, type: 'radio', checked: value, title: title, parentId: parentMenu, 'contexts': contexts});
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
		return chrome.contextMenus.update(menuId, {checked: true});
	};
};
