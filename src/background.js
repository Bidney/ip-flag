const REFRESH_ALARM_NAME = "refreshIP";
const REFRESH_PERIOD_MINUTES = 5;
const IP_ONLY_LOOKUP_URL = "http://ip-api.com/json/?fields=status,message,query";
const FULL_LOOKUP_URL = "http://ip-api.com/json/?fields=status,message,query,country,countryCode,regionName,city";
const DEFAULT_ICON_PATHS = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png"
};

chrome.runtime.onInstalled.addListener(() => {
  hardenStorageAccess();
  scheduleRefresh();
  restoreActionFromCache().catch(() => {});
  refreshIPInfo({ useCacheOnError: true }).catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  hardenStorageAccess();
  scheduleRefresh();
  restoreActionFromCache().catch(() => {});
  refreshIPInfo({ useCacheOnError: true }).catch(() => {});
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REFRESH_ALARM_NAME) {
    refreshIPInfo({ useCacheOnError: true }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchIP") {
    refreshIPInfo({ useCacheOnError: true })
      .then(({ info, cached }) => sendResponse({ success: true, info, cached }))
      .catch((error) => {
        sendResponse({ success: false, error: error.message || "IP lookup failed" });
      });

    return true;
  }

  return false;
});

function hardenStorageAccess() {
  if (!chrome.storage || !chrome.storage.local || !chrome.storage.local.setAccessLevel) {
    return;
  }

  try {
    const accessLevelUpdate = chrome.storage.local.setAccessLevel({
      accessLevel: "TRUSTED_CONTEXTS"
    });

    if (accessLevelUpdate && typeof accessLevelUpdate.catch === "function") {
      accessLevelUpdate.catch(() => {});
    }
  } catch (error) {
    // Older Chrome versions may not support storage access levels.
  }
}

function scheduleRefresh() {
  chrome.alarms.create(REFRESH_ALARM_NAME, {
    periodInMinutes: REFRESH_PERIOD_MINUTES
  });
}

async function refreshIPInfo({ useCacheOnError = false } = {}) {
  try {
    return await getCurrentIPInfo();
  } catch (error) {
    if (useCacheOnError) {
      const cachedInfo = await getCachedIPInfo();

      if (cachedInfo) {
        await updateActionFromInfo(cachedInfo);
        return { info: cachedInfo, cached: true };
      }
    }

    throw error;
  }
}

async function getCurrentIPInfo() {
  const cachedInfo = await getCachedIPInfo();

  if (cachedInfo && cachedInfo.ip) {
    const currentIP = await fetchCurrentIP();

    if (currentIP && currentIP === cachedInfo.ip) {
      await updateActionFromInfo(cachedInfo);
      return { info: cachedInfo, cached: true };
    }
  }

  const info = await fetchFullIPInfo();

  await chrome.storage.local.set({ ipInfo: info });
  await updateActionFromInfo(info);

  return { info, cached: false };
}

async function fetchCurrentIP() {
  const response = await fetch(IP_ONLY_LOOKUP_URL);

  if (!response.ok) {
    throw new Error("IP check request failed");
  }

  const data = await response.json();

  if (data.status === "fail") {
    throw new Error(data.message || "IP check failed");
  }

  return data.query || "";
}

async function fetchFullIPInfo() {
  const response = await fetch(FULL_LOOKUP_URL);

  if (!response.ok) {
    throw new Error("IP lookup request failed");
  }

  const data = await response.json();

  if (data.status === "fail") {
    throw new Error(data.message || "IP lookup failed");
  }

  return {
    ip: data.query || "",
    country: data.country || "",
    countryCode: data.countryCode || "",
    region: data.regionName || "",
    city: data.city || "",
    lastUpdated: new Date().toISOString()
  };
}

async function getCachedIPInfo() {
  const result = await chrome.storage.local.get("ipInfo");
  return result.ipInfo || null;
}

async function restoreActionFromCache() {
  const cachedInfo = await getCachedIPInfo();

  if (cachedInfo) {
    await updateActionFromInfo(cachedInfo);
  }
}

async function updateActionFromInfo(info) {
  const countryCode = String(info.countryCode || "").trim().toLowerCase();
  const titleParts = [
    info.ip,
    info.country,
    info.region,
    info.city
  ].filter(Boolean);

  await chrome.action.setTitle({
    title: titleParts.length ? `IP Region Flag: ${titleParts.join(" - ")}` : "IP Region Flag"
  });

  if (countryCode) {
    await setFlagIcon(countryCode);
  } else {
    await chrome.action.setIcon({ path: DEFAULT_ICON_PATHS });
    await chrome.action.setBadgeText({ text: "" });
  }
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

    await chrome.action.setIcon({
      imageData: {
        16: imageData[16],
        32: imageData[32],
        48: imageData[48],
        128: imageData[128]
      }
    });

    await chrome.action.setBadgeText({ text: "" });
  } catch (error) {
    await chrome.action.setBadgeText({ text: countryCode.toUpperCase() });
    await chrome.action.setBadgeBackgroundColor({ color: "#4A90D9" });
  }
}