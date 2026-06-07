# Chrome Web Store listing notes

## Short description

View your public IP address, approximate region, city, country, and current country flag in one click.

## Detailed description

IP Region Flag is a simple Chrome extension that shows your current public IP address and approximate IP-based location.

Open the extension popup to quickly see your IP address, country, region, city, current country flag, and last update time.

The toolbar icon updates to show the detected country flag, making it easy to see which country your current connection appears to be using. This is useful when checking a VPN connection, confirming your public network location, or quickly viewing basic IP region details.

The extension keeps the interface small and focused. There is no account, no dashboard, and no unnecessary clutter.

## Single purpose description

IP Region Flag shows the user's current public IP address, approximate IP-based country, region, city, and matching country flag.

## Permission justification

### alarms

Used to refresh the stored IP location details periodically so the toolbar flag and popup stay current when the user's network or VPN changes.

### storage

Used to save the latest IP lookup result locally in Chrome storage so the popup opens quickly and the toolbar icon can show the last detected country.

### host permissions

Required to request IP location data from ip-api.com and country flag images from flagcdn.com. These hosts are used only for IP lookup and flag display. The extension does not read or change website content.

### remote code

The extension does not execute remote code. All JavaScript, HTML, and CSS are packaged inside the extension ZIP. Network requests only retrieve JSON IP location data and PNG flag images.
