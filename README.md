![](screenshots/chrome-medium-tile.png)

Exploratory testing assistant for Chrome and Firefox. Adds common problematic values and edge cases to the context menu (right-click), so you can keep them handy and access them easily during exploratory testing sessions.  

## Features

* Convenient access to common boundaries and edge cases for exploratory testing
* Extend it with your own config files easily
* Works on input fields, text areas, content editable elements
* Works on multi-frame pages, but only if they are from the same domain
* Works in Chrome and Firefox
* Tiny overhead per page (<1k), no 3rd party library dependencies, completely passive, so it does not interfere with your web app execution in any way

## Usage

The easiest way to install the extension is from the [Chrome Web store](https://chrome.google.com/webstore/detail/efhedldbjahpgjcneebmbolkalbhckfi) or [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/bug-magnet/).

After installation, right-click on the page and you'll see a Bug Magnet submenu. Click an item there, and it will be inserted into the focused (or last-clicked) editable field.

### Local development builds
- Chrome: `npm run pack-extension` and load `pack/` as an unpacked extension.
- Firefox: `npm run pack-extension-firefox` and load `pack/` as a temporary add-on.

### Modes
Bug Magnet provides three operational modes:
- **Inject value**: directly sets the value and triggers input/change events.
- **Simulate pasting**: dispatches a real paste event and inserts text at the cursor if the page allows it.
- **Copy to clipboard**: copies the value so you can paste manually.

Switch modes from the "Operational mode" submenu. Paste/copy modes may prompt for clipboard permissions.

## More infomation 

* [What's new in the latest version?](https://bugmagnet.org/v3.html)
* [How to install and use BugMagnet?](https://bugmagnet.org/using.html)
* [How to contribute or support development?](https://bugmagnet.org/contributing.html)
* [How to customise menus?](https://bugmagnet.org/customising.html)
* [Developer Guide](CONTRIBUTING.md)
* [Resources about edge cases in BugMagnet menus](https://bugmagnet.org/resources.html).

## Authors 

* [Gojko Adzic](https://gojko.net) 
* [@bbbco](http://twitter.com/bbbco) (old Firefox Addon)

----

## Icon credit

Magnet icon from [Woothemes Ultimate Icon Set by Nishan Sothilingam](http://iconfindr.com/1vSsaKB)
