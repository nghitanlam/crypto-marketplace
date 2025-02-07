const coinsCount = document.getElementById("coins-count");
const exchangesCount = document.getElementById("exchanges-count");
const marketCap = document.getElementById("marketCap");
const marketCapChangeElement = document.getElementById("marketCapChange");
const volume = document.getElementById("volume");
const dominance = document.getElementById("dominance");

document.addEventListener("DOMContentLoaded", () => {
  fetchGlobal();
});

function getLocalStorageData(key) {
  const storedData = localStorage.getItem(key);
  if (!storedData) return null;

  const parsedData = JSON.parse(storedData);
  const currentTime = Date.now();

  // Data was older than 5 min
  if (currentTime - parsedData.timestamp > 300000) {
    localStorage.removeItem(key);
    return null;
  }
  return parsedData.data;
}

function setLocalStorageData(key, data) {
  const storedData = {
    timestamp: Date.now(),
    data: data,
  };
  localStorage.setItem(key, JSON.stringify(storedData));
}

function fetchGlobal() {
  const localStorageKey = "Global_Data";
  const localData = getLocalStorageData(localStorageKey);

  if (localData) {
    displayGlobalData(localData);
  } else {
    const options = { method: "GET", headers: { accept: "application/json" } };
    fetch("https://api.coingecko.com/api/v3/global", options)
      .then((res) => res.json())
      .then((data) => {
        const globalData = data.data;
        displayGlobalData(data);
        setLocalStorageData(localStorageKey, globalData);
      })
      .catch((error) => {
        coinsCount.textContent = "N/A";
        exchangesCount.textContent = "N/A";
        marketCap.textContent = "N/A";
        marketCapChangeElement.textContent = "N/a";
        volume.textContent = "N/A";
        dominance.textContent = "BTC N/A% - ETH N/A%";
        console.error(error);
      });
  }
}

function displayGlobalData(globalData) {
  coinsCount.textContent = globalData.active_cryptocurrencies || "N/A";
  exchangesCount.textContent = globalData.markets || "N/A";
  marketCap.textContent = globalData.total_market_cap?.usd
    ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(3)}T`
    : "N/A";
  const marketCapChange = globalData.market_cap_change_percentage_24h_usd;
  if (marketCapChange !== undefined) {
    const changeText = `${marketCapChange.toFixed(1)}%`;
    marketCapChangeElement.innerHTML = `${changeText} <i class="${marketCapChange < 0 ? "red" : "green"} ri-arrow-${marketCapChange < 0 ? "down" : "up"}-s-fill"></i>`;
    marketCapChangeElement.style.color = marketCapChange < 0 ? "red" : "green";
  } else {
    marketCapChangeElement.textContent = "N/A";
  }

  volume.textContent = globalData.total_volume?.usd
    ? `$${(globalData.total_volume.usd / 1e9).toFixed(3)}B`
    : "N/A";

  const btcDominance = globalData.market_cap_percentage?.btc
    ? `${globalData.market_cap_percentage.btc.toFixed(1)}%`
    : "N/A";

  const ethDominance = globalData.market_cap_percentage?.eth
    ? `${globalData.market_cap_percentage.eth.toFixed(1)}%`
    : "N/A";

  dominance.textContent = `BTC ${btcDominance} - ETH ${ethDominance}`;
}
