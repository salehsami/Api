require("dotenv").config();
const axios = require("axios");

const express = require("express");
const app = express();
const port = 3000;
const mapsApiKey = process.env.mapsApiKey;
const weatherApiKey = process.env.weatherApiKey;

app.use(express.json());

const getCoordinates = async (address, forWeather = false) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${mapsApiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      if (!forWeather) {
        return {
          message: `Coordinates for ${address} are: `,
          latitude: location.lat,
          long: location.lng,
        };
      } else {
        return {
          lat: location.lat,
          long: location.lng,
        };
      }
    } else {
      throw new Error(`Error: ${data.status}, ${data.error_message || ""}`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const getWeatherInfo = async (address) => {
  const { lat, long } = await getCoordinates(address, true);

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${weatherApiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (response.status === 200) {
      return {
        message: `Weather info for ${address}`,
        Location: {
          Latitude: data.coord.lat || "N/A",
          Longitude: data.coord.lon || "N/A",
          Name: data.name || "N/A",
          Country: data.sys.country || "N/A",
        },
        Weather: data.weather[0].description || "N/A",
        Temperature: data.main.temp || "N/A",
        "Feels Like": data.main.feels_like || "N/A",
        "Min Temperature": data.main.temp_min || "N/A",
        "Max Temperature": data.main.temp_max || "N/A",
        "Air Pressure": data.main.pressure || "N/A",
        Humidity: data.main.humidity || "N/A",
        "Sea Level": data.main.sea_level || "N/A",
        "Ground Level": data.main.grnd_level || "N/A",
        Visibility: data.visibility || "N/A",
        Wind: {
          Speed: data.wind.speed || "N/A",
          Direction: data.wind.deg || "N/A",
          Gust: data.wind.gust || "N/A",
        },
        Clouds: data.clouds.all || "N/A",

        Sunrise:
          new Date(data.sys.sunrise * 1000).toLocaleTimeString() || "N/A",
        Sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString() || "N/A",
        "Time of Data Calculation":
          new Date(data.dt * 1000).toLocaleTimeString() || "N/A",
        "Timezone Offset": data.timezone / 3600 + " hours" || "N/A",
      };
    } else {
      throw new Error(
        `Error ${data.status}, ${data.error_message || "Occured"}`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

app.get("/getCoordinates", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Address parameter is required" });
  } else {
    try {
      const location = await getCoordinates(address);
      res.json(location);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

app.get("/getWeather", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "Address parameter is required" });
  } else {
    try {
      const weather = await getWeatherInfo(address);
      res.json(weather);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
