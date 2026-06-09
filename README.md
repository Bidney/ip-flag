# IP Region Flag

IP Region Flag is a small Chrome extension that shows your current public IP address, approximate region, city, country, and matching country flag.

The extension is useful when you want to quickly check which country and region your current network connection appears to use. It can also help when checking a VPN connection.

## Features

- Shows the current public IP address
- Shows approximate country, region, and city
- Displays the matching country flag in the popup
- Updates the toolbar icon to match the detected country
- Checks the current public IP every few minutes
- Reuses cached region details when the public IP has not changed
- Stores only the latest lookup result in local Chrome storage

## How it works

The extension requests public IP details from ip-api.com and country flag images from flagcdn.com.

After a successful full lookup, the latest result is stored locally in Chrome storage so the popup can load quickly and the toolbar icon can show the last detected country.

On later refreshes, the extension first performs a lightweight IP-only check. If the public IP is the same as the cached IP, the extension reuses the cached country, region, city, and flag instead of requesting the full region details again. If the public IP has changed, the extension requests fresh region details and updates the cache.

The extension does not read website content, browsing history, passwords, form data, messages, or files.

## Install locally

1. Download or clone this repository.
2. Open Chrome.
3. Go to chrome://extensions.
4. Turn on Developer mode.
5. Click Load unpacked.
6. Select the src folder.

## Chrome Web Store package

The store upload package should contain the contents of the src folder at the ZIP root.

To build the package:

python scripts/validate_package.py

The script creates:

dist/ip_region_flag_0_0_5_chrome_web_store.zip

## Permissions

The extension requests:

- alarms: checks the current public IP periodically.
- storage: stores the latest IP lookup result locally.
- http://ip-api.com/*: requests the current public IP and, when needed, IP location details.
- https://flagcdn.com/*: loads country flag images.

## Version

Current version: 0.0.5

## License

MIT