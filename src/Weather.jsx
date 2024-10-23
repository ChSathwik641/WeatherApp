import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import "./App.css";

const weatherKey = "ea13cf2c5f9446e69a754508242110";
const openWeatherKey = "aa83e44fed66fcea8d5ffb46e9645fb6";
const weatherBaseUrl = "https://api.weatherapi.com/v1/";
const openWeatherBaseUrl = "https://api.openweathermap.org/data/2.5/";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { handleSubmit, getValues, setValue, control } = useForm({
    mode: "onSubmit",
  });
  const inputRef = useRef(null);
  const date = new Date();
  const day = date.getDay();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        setError("Location access denied. Please search manually.");
      }
    );
  }, []);
  const fetchWeatherByCoordinates = async (lat, lon) => {
    setLoading(true);
    try {
      const currentUrl = `${weatherBaseUrl}current.json?key=${weatherKey}&q=${lat},${lon}`;
      const forecastUrl = `${weatherBaseUrl}forecast.json?key=${weatherKey}&q=${lat},${lon}&days=10&hour=1`;
      const historicalUrl = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i - 1);
        const dt = date.toISOString().split("T")[0];
        return `${weatherBaseUrl}history.json?key=${weatherKey}&q=${lat},${lon}&dt=${dt}`;
      });

      const currentResp = await axios.get(currentUrl);
      const forecastResp = await axios.get(forecastUrl);
      const pastResp = await Promise.all(
        historicalUrl.map((url) => axios.get(url))
      );
      const pastData = pastResp.map(
        (response) => response.data.forecast.forecastday[0]
      );

      const hourlyUrl = `${openWeatherBaseUrl}forecast?lat=${lat}&lon=${lon}&appid=${openWeatherKey}&units=metric`;
      const hourlyResp = await axios.get(hourlyUrl);

      const hourlyData = hourlyResp.data.list.map((item) => ({
        dateTime: new Date(item.dt * 1000).toLocaleString(),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        precipitationType: item.weather[0].main,
        weatherCode: item.weather[0].id,
      }));

      console.log(currentResp);
      console.log(forecastResp);
      console.log(hourlyData);

      setWeatherData({
        location: currentResp.data.location,
        current: currentResp.data.current,
        forecast: forecastResp.data.forecast.forecastday,
        past: pastData,
      });

      setHourlyData(hourlyData);
      setError(null);
    } catch (err) {
      setError(`Error fetching weather data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (inputLocation) => {
    setLoading(true);
    try {
      const currentUrl = `${weatherBaseUrl}current.json?key=${weatherKey}&q=${inputLocation}`;
      const forecastUrl = `${weatherBaseUrl}forecast.json?key=${weatherKey}&q=${inputLocation}&days=10&hour=1`;
      const historicalUrl = Array.from({ length: 10 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i - 1);
        const dt = date.toISOString().split("T")[0];
        return `https://api.weatherapi.com/v1/history.json?key=${weatherKey}&q=${inputLocation}&dt=${dt}`;
      });

      const currentResp = await axios.get(currentUrl);
      const forecastResp = await axios.get(forecastUrl);
      const pastResp = await Promise.all(
        historicalUrl.map((url) => axios.get(url))
      );
      const pastData = pastResp.map(
        (response) => response.data.forecast.forecastday[0]
      );

      const hourlyUrl = `${openWeatherBaseUrl}forecast?q=${inputLocation}&appid=${openWeatherKey}&units=metric`;
      const hourlyResp = await axios.get(hourlyUrl);

      const hourlyData = hourlyResp.data.list.map((item) => ({
        dateTime: new Date(item.dt * 1000).toLocaleString(),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        precipitationType: item.weather[0].main,
        weatherCode: item.weather[0].id,
      }));

      console.log(currentResp);
      console.log(forecastResp);
      console.log(hourlyData);

      setWeatherData({
        location: currentResp.data.location,
        current: currentResp.data.current,
        forecast: forecastResp.data.forecast.forecastday,
        past: pastData,
      });

      setHourlyData(hourlyData);
      setError(null);
    } catch (err) {
      setError(`Error fetching weather data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <div
        className={`fixed top-0 left-0 w-full flex items-center justify-between p-4 shadow-lg z-50 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h1 className="text-4xl font-bold">Weather App</h1>
        <form
          onSubmit={handleSubmit((data) => {
            fetchWeather(data.searchInput);
          })}
          className="input mx-auto w-1/3"
        >
          <Controller
            control={control}
            name="searchInput"
            render={() => (
              <input
                value={getValues("searchInput")}
                ref={inputRef}
                onChange={(e) => {
                  setValue("searchInput", e.target.value);
                }}
                placeholder="Enter a location"
                className={` ${
                  isDarkMode ? "bg-gray-600 text-white" : "bg-white text-black"
                } w-full`}
              />
            )}
          />
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
          </button>
        </form>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`ml-4 px-4 py-2 rounded-lg ${
            isDarkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
          }`}
        >
          {isDarkMode ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {loading && (
        <div>
          <div className="flex justify-center items-center h-screen">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-center text-2xl font-bold">Searching....</p>
          </div>
        </div>
      )}
      {error && <p>{error}</p>}

      <div className="flex mt-300">
        {weatherData && weatherData.forecast && (
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              Forecast for Next 10 Days
            </h3>
            {weatherData.forecast.map((forc, index) => (
              <div key={index}>
                <p>Date: {forc.date}</p>
                <p>Min Temp: {forc.day.mintemp_c}°C</p>
                <p>Max Temp: {forc.day.maxtemp_c}°C</p>
                <div>
                  <img
                    src={`https:${forc.day.condition.icon}`}
                    alt="Weather icon"
                    className="weather-icon"
                  />
                  <p>Condition: {forc.day.condition.text}</p>
                </div>
                <p>Chance of Rain: {forc.day.daily_chance_of_rain}%</p>
                {forc.day.daily_chance_of_snow > 0 && (
                  <p>Chance of Snow: {forc.day.daily_chance_of_snow}%</p>
                )}
              </div>
            ))}
          </div>
        )}

        {weatherData && (
          <div className="m-16 p-10">
            <div>
              <p>Weather results for {weatherData.location.name}</p>
              <div>{days[day]}</div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Current Weather</h3>
              <p>Temperature: {weatherData.current.temp_c} °C</p>
              <div>
                <img
                  src={`https:${weatherData.current.condition.icon}`}
                  alt="Weather icon"
                  className="weather-icon"
                />
              </div>
              <p>Condition: {weatherData.current.condition.text}</p>
              <p>Humidity: {weatherData.current.humidity} %</p>
              <p>Wind: {weatherData.current.wind_kph} kph</p>
              <p>Wind Direction:{weatherData.current.wind_dir}</p>
              <p>Wind Degree : {weatherData.current.wind_degree}</p>
              <p>Feelslike: {weatherData.current.feelslike_c}</p>
            </div>
          </div>
        )}

        {weatherData && weatherData.past && (
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              Weather Data in Past 10 Days
            </h3>
            {weatherData.past.map((pastDay, index) => (
              <div key={index}>
                <p>Date: {pastDay.date}</p>
                <p>Min Temp: {pastDay.day.mintemp_c}°C</p>
                <p>Max Temp: {pastDay.day.maxtemp_c}°C</p>
                <div>
                  <img
                    src={`https:${pastDay.day.condition.icon}`}
                    alt="Weather icon"
                    className="weather-icon"
                  />
                  <p>Condition: {pastDay.day.condition.text}</p>
                </div>
                <p>Chance of Rain: {pastDay.day.daily_chance_of_rain}%</p>
                {pastDay.day.daily_chance_of_snow > 0 && (
                  <p>Chance of Snow: {pastDay.day.daily_chance_of_snow}%</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {hourlyData && (
        <div>
          <h3 className="text-2xl font-semibold mb-2">
            Weather Forecast for next 48hours in {weatherData.location.name}
          </h3>
          <div className="grid grid-cols-3 gap-4 col">
            {hourlyData.map((hour, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <p>DateTime: {hour.dateTime}</p>
                <p>Temperature: {hour.temperature} °C</p>
                <p>Humidity: {hour.humidity} %</p>

                <div className="img">
                  {hour.precipitationType === "Clouds" && (
                    <img src="./clouds.png" alt="Clouds" />
                  )}
                  {hour.precipitationType === "Clear" && (
                    <img src="./clear.png" alt="Clear" />
                  )}
                  {hour.precipitationType === "Drizzle" && (
                    <img src="./drizzle.png" alt="Drizzle" />
                  )}
                  {hour.precipitationType === "Haze" && (
                    <img src="./haze.png" alt="Haze" />
                  )}
                  {hour.precipitationType === "Humidity" && (
                    <img src="./humidity.png" alt="Humidity" />
                  )}
                  {hour.precipitationType === "Mist" && (
                    <img src="./mist.png" alt="Mist" />
                  )}
                  {hour.precipitationType === "Rain" && (
                    <img src="./rain.png" alt="Rain" />
                  )}
                  {hour.precipitationType === "Snow" && (
                    <img src="./snow.png" alt="Snow" />
                  )}
                  <p> {hour.precipitationType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
