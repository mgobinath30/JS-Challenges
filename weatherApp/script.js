// https://api.openweathermap.org/data/2.5/weather?q=bangalore&appid=099da853c12230034bc8fef47cee5aea

const API_KEY = "6cef678131a56b01553b6e7aa34f11b3";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?units=metric";

// Helper
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}

// Model

// View
class WeatherView {
  #searchBtn = document.querySelector("#searchbtn");
  #parentElement = document.querySelector(".card");

  getSearchCity(handler) {
    this.#searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const query = document.querySelector("#searchcity").value.trim("");
      handler(query);
    });
  }

  render(data) {
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".temp").textContent =
      Math.round(data?.main?.temp) + " °C";
    document.querySelector(".humidity").textContent =
      data?.main?.humidity + " %";
    document.querySelector(".windspeed").textContent =
      data?.wind?.speed + " Km/h";
  }
}

// Controller
const weatherView = new WeatherView();
async function updateWeatherController(city) {
  try {
    const data = await fetchData(`${BASE_URL}?q=${city}&appid=${API_KEY}'`);
    console.log(data);
    weatherView.render(data);
  } catch (err) {
    console.log(err);
  }
}

function init() {
  weatherView.getSearchCity(updateWeatherController);
}

init();
