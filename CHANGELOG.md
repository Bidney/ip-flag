# Changelog

## 0.0.5

- Adds a lightweight IP-only check before requesting full region details.
- Reuses the cached country, region, city, and flag when the public IP has not changed.
- Restores the toolbar icon from cached data when Chrome starts or the extension service worker wakes up.
- Keeps the periodic refresh behavior while avoiding unnecessary full region lookups.
- Limits extension storage access to trusted extension contexts when the Chrome API is available.

## 0.0.4

- Uses the working ip-api.com lookup flow.
- Keeps flagcdn.com for country flag display.
- Adds cached fallback behavior if a live lookup fails after a previous successful lookup.
- Uses complete icon references for 16, 32, 48, and 128 px icons.
- Keeps the popup simple and focused.

## 0.0.3

- Initial store-ready package.