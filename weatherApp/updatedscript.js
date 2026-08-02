// ==========================================
// CONFIG & UTILS
// ==========================================
// Note: In production, route API calls through a backend proxy to protect API_KEY.
const API_KEY = "6cef678131a56b01553b6e7aa34f11b3";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const REQUEST_TIMEOUT_SEC = 5;

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${s} seconds`));
    }, s * 1000);
  });
};

// ==========================================
// SERVICE / MODEL LAYER
// ==========================================
async function fetchWeatherData(city) {
  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

    // Race network request against timeout promise
    const fetchPromise = fetch(url);
    const response = await Promise.race([
      fetchPromise,
      timeout(REQUEST_TIMEOUT_SEC),
    ]);

    if (!response.ok) {
      if (response.status === 404) throw new Error("City not found.");
      throw new Error(`Failed to fetch weather data (${response.status})`);
    }

    return await response.json();
  } catch (err) {
    throw err; // Re-throw to be handled by controller
  }
}

// ==========================================
// VIEW LAYER
// ==========================================
class WeatherView {
  #searchBtn = document.querySelector("#searchbtn");
  #searchInput = document.querySelector("#searchcity");

  // Cache DOM targets for rendering efficiency
  #cityEl = document.querySelector(".city");
  #tempEl = document.querySelector(".temp");
  #humidityEl = document.querySelector(".humidity");
  #windSpeedEl = document.querySelector(".windspeed");

  bindSearchHandler(handler) {
    this.#searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const query = this.#searchInput.value.trim();
      if (!query) return;

      handler(query);
      this.#searchInput.value = ""; // Clear input after submit
    });
  }

  render(data) {
    this.#cityEl.textContent = data.name ?? "N/A";
    this.#tempEl.textContent =
      data.main?.temp != null ? `${Math.round(data.main.temp)} °C` : "N/A";
    this.#humidityEl.textContent =
      data.main?.humidity != null ? `${data.main.humidity} %` : "N/A";
    this.#windSpeedEl.textContent =
      data.wind?.speed != null ? `${data.wind.speed} Km/h` : "N/A";
  }

  renderError(errorMessage) {
    // Graceful UI error reporting instead of native alert()
    this.#cityEl.textContent = `Error: ${errorMessage}`;
    this.#tempEl.textContent = "--";
    this.#humidityEl.textContent = "--";
    this.#windSpeedEl.textContent = "--";
  }
}

// ==========================================
// CONTROLLER LAYER
// ==========================================
const weatherView = new WeatherView();

async function updateWeatherController(city) {
  try {
    const data = await fetchWeatherData(city);
    weatherView.render(data);
  } catch (err) {
    console.error("Controller Error:", err.message);
    weatherView.renderError(err.message);
  }
}

function init() {
  weatherView.bindSearchHandler(updateWeatherController);
}

init();
