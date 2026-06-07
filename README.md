# IP Region Flag

IP Region Flag is a small Chrome extension that shows your current public IP address, approximate region, city, country, and matching country flag.

The extension is useful when you want to quickly check which country and region your current network connection appears to use. It can also help when checking a VPN connection.

## Features

- Shows the current public IP address
- Shows approximate country, region, and city
- Displays the matching country flag in the popup
- Updates the toolbar icon to match the detected country
- Refreshes the stored IP details every few minutes
- Stores only the latest lookup result in local Chrome storage

## How it works

The extension requests public IP location details from ip-api.com and country flag images from flagcdn.com.

The latest lookup result is stored locally in Chrome storage so the popup can load quickly. The extension does not read website content, browsing history, passwords, form data, messages, or files.

## Install locally

1. Download or clone this repository.
2. Open Chrome.
3. Go to `chrome://extensions`.
4. Turn on Developer mode.
5. Click Load unpacked.
6. Select the `src` folder.

## Chrome Web Store package

The store upload package should contain the contents of the `src` folder at the ZIP root.

To build the package:

```bash
python scripts/validate_package.py
```

The script creates:

```text
dist/ip_region_flag_0_0_4_chrome_web_store.zip
```

## Permissions

The extension requests:

- `alarms`: refreshes IP location details periodically.
- `storage`: stores the latest lookup result locally.
- `http://ip-api.com/*`: requests public IP location details.
- `https://flagcdn.com/*`: loads country flag images.

## Version

Current version: 0.0.4

## License

MIT
