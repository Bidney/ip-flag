document.addEventListener("DOMContentLoaded", () => {
  refreshAndDisplay();
});

async function refreshAndDisplay() {
  const loading = document.getElementById("loading");
  const infoPanel = document.getElementById("info");

  loading.textContent = "Loading...";
  loading.classList.remove("hidden");
  infoPanel.classList.add("hidden");

  chrome.runtime.sendMessage({ action: "fetchIP" }, (response) => {
    if (chrome.runtime.lastError || !response || !response.success || !response.info) {
      loading.textContent = "Unable to load IP details.";
      return;
    }

    displayInfo(response.info);
  });
}

function displayInfo(info) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("info").classList.remove("hidden");

  const countryCode = String(info.countryCode || "").toLowerCase();
  const flag = document.getElementById("flag");

  if (countryCode) {
    flag.src = `https://flagcdn.com/w160/${countryCode}.png`;
    flag.alt = `${info.country || "Country"} flag`;
    flag.classList.remove("hidden");
  } else {
    flag.removeAttribute("src");
    flag.alt = "";
    flag.classList.add("hidden");
  }

  document.getElementById("ip").textContent = info.ip || "Unknown";
  document.getElementById("country").textContent = info.country || "Unknown";
  document.getElementById("region").textContent = info.region || "Unknown";
  document.getElementById("city").textContent = info.city || "Unknown";

  const updated = new Date(info.lastUpdated);
  document.getElementById("lastUpdated").textContent = Number.isNaN(updated.getTime()) ? "Unknown" : updated.toLocaleTimeString();
}
