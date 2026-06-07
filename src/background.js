chrome.runtime.onInstalled.addListener(() => {
  scheduleRefresh();
  fetchIPInfo();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleRefresh();
  fetchIPInfo();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshIP") {
    fetchIPInfo();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchIP") {
    fetchIPInfo()
      .then((info) => sendResponse({ success: true, info }))
      .catch((error) => {
        chrome.storage.local.get("ipInfo", (result) => {
          if (result.ipInfo) {
            sendResponse({ success: true, info: result.ipInfo, cached: true });
          } else {
            sendResponse({ success: false, error: error.message || "IP lookup failed" });
          }
        });
      });

    return true;
  }

  return false;
});

function scheduleRefresh() {
  chrome.alarms.create("refreshIP", { periodInMinutes: 5 });
}

async function fetchIPInfo() {
  const response = await fetch("http://ip-api.com/json/?fields=status,message,query,country,countryCode,regionName,city");

  if (!response.ok) {
    throw new Error("IP lookup request failed");
  }

  const data = await response.json();

  if (data.status === "fail") {
    throw new Error(data.message || "IP lookup failed");
  }

  const info = {
    ip: data.query || "",
    country: data.country || "",
    countryCode: data.countryCode || "",
    region: data.regionName || "",
    city: data.city || "",
    lastUpdated: new Date().toISOString()
  };

  const stored = await chrome.storage.local.get("ipInfo");

  if (info.countryCode && (!stored.ipInfo || stored.ipInfo.countryCode !== info.countryCode)) {
    await setFlagIcon(String(info.countryCode).toLowerCase());
  }

  await chrome.storage.local.set({ ipInfo: info });

  if (info.ip) {
    chrome.action.setTitle({ title: info.ip });
  }

  return info;
}

async function setFlagIcon(countryCode) {
  try {
    const response = await fetch(`https://flagcdn.com/w40/${countryCode}.png`);

    if (!response.ok) {
      throw new Error("Flag request failed");
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const sizes = [16, 32, 48, 128];
    const imageData = {};

    for (const size of sizes) {
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext("2d");
      const padding = Math.round(size * 0.1);
      const flagWidth = size - padding * 2;
      const flagHeight = Math.round(flagWidth * 0.67);
      const yOffset = Math.round((size - flagHeight) / 2);
      const radius = size * 0.12;

      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.roundRect(padding, yOffset, flagWidth, flagHeight, radius);
      ctx.clip();
      ctx.drawImage(bitmap, padding, yOffset, flagWidth, flagHeight);
      imageData[size] = ctx.getImageData(0, 0, size, size);
    }

    chrome.action.setIcon({
      imageData: {
        16: imageData[16],
        32: imageData[32],
        48: imageData[48],
        128: imageData[128]
      }
    });

    chrome.action.setBadgeText({ text: "" });
  } catch (error) {
    chrome.action.setBadgeText({ text: countryCode.toUpperCase() });
    chrome.action.setBadgeBackgroundColor({ color: "#4A90D9" });
  }
}
