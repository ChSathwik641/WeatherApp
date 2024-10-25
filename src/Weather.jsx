import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import "./App.css";

const weatherKey = "3c4183720e3642d29e4133418242510";
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
      const forecastUrl = `${weatherBaseUrl}forecast.json?key=${weatherKey}&q=${inputLocation}&days=10&hour=2`;
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

      <div className="flex justify-evenly items-center mt-4 ml-0 pt-10">
        {weatherData && weatherData.forecast && (
          <div className="flex-grid justify-start items-center">
            <div className="flex justify-center items-center">
              <h1 className="text-lg mb-2">
                Forecast in {weatherData.location.name} for next 10 days
              </h1>
            </div>
            <div
              className={`h-96 overflow-y-auto custom-scrollbar rounded-lg shadow-lg ${
                isDarkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {weatherData.forecast.map((forc, index) => (
                <div
                  key={index}
                  className="flex justify-around items-center p-2 mb-2 h-auto"
                >
                  <p> {forc.date}</p>
                  <div className="grid place-items-center ">
                    <img
                      src={`https:${forc.day.condition.icon}`}
                      alt="Weather icon"
                      className="weather-icon flex"
                    />
                    <p> {forc.day.condition.text}</p>
                  </div>
                  <div>
                    {" "}
                    <p> {forc.day.maxtemp_c}°C</p>
                    <p> {forc.day.mintemp_c}°C</p>
                  </div>
                  <p>Rain: {forc.day.daily_chance_of_rain}%</p>
                  {forc.day.daily_chance_of_snow > 0 && (
                    <p>Snow: {forc.day.daily_chance_of_snow}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pl-5 pr-2">
          {weatherData && (
            <div className="m-16 p-10">
              <div className="grid place-items-center text-xl font-semibold">
                <p className="pb-1">
                  Weather results for {weatherData.location.name}
                </p>
                <p className="pb-1">{days[day]}</p>
                <p className="pb-1">{weatherData.current.last_updated}</p>
              </div>
              <div
                className={`grid place-items-center m-1.5 p-4 rounded-lg shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-100"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="grid place-items-center">
                    <img
                      src={`https:${weatherData.current.condition.icon}`}
                      alt="Weather icon"
                      style={{ width: "120px", height: "120px" }}
                    />
                    <p className="text-4x1">
                      {" "}
                      {weatherData.current.condition.text}
                    </p>
                  </div>
                  <div className="text-7xl">
                    <p>{weatherData.current.temp_c} °C</p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="p1">
                    🌅{weatherData.forecast[0].astro.sunrise}
                  </p>
                  <p className="p1">🌇{weatherData.forecast[0].astro.sunset}</p>
                  <p className="p-1">
                    Feelslike: {weatherData.current.feelslike_c}
                  </p>
                  <p className="p-1">
                    Rain: {weatherData.forecast[0].day.daily_chance_of_rain}%
                  </p>
                  <p className="p-1">
                    Humidity: {weatherData.current.humidity} %
                  </p>
                  <p className="p-1">
                    Wind: {weatherData.current.wind_kph} kph
                  </p>
                  <p className="p-1">
                    Wind Direction:{weatherData.current.wind_dir}
                  </p>
                  <p>Wind Degree : {weatherData.current.wind_degree}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {weatherData && weatherData.past && (
          <div className="flex-grid justify-start items-center">
            <div className="flex justify-center items-center">
              <h1 className="text-lg mb-2">
                Forecast in {weatherData.location.name} for past 10 days
              </h1>
            </div>
            <div
              className={`h-96 overflow-y-auto custom-scrollbar rounded-lg shadow-lg ${
                isDarkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {weatherData.past.map((pastDay, index) => (
                <div
                  key={index}
                  className="flex justify-around items-center p-2 mb-2"
                >
                  <p>{pastDay.date}</p>
                  <div className="grid place-items-center ">
                    <img
                      src={`https:${pastDay.day.condition.icon}`}
                      alt="Weather icon"
                      className="weather-icon"
                    />
                    <p> {pastDay.day.condition.text}</p>
                  </div>
                  <div>
                    {" "}
                    <p> {pastDay.day.mintemp_c}°C</p>
                    <p> {pastDay.day.maxtemp_c}°C</p>
                  </div>

                  <p>Rain:{pastDay.day.daily_chance_of_rain}%</p>
                  {pastDay.day.daily_chance_of_snow > 0 && (
                    <p> {pastDay.day.daily_chance_of_snow}%</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {hourlyData && (
        <div>
          <h3 className="text-lg mb-2">
            Weather Forecast in {weatherData.location.name} for next 48hours
          </h3>
          <div
            className={`flex overflow-x-auto custom-scrollbar rounded-lg shadow-lg ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {hourlyData.map((hour, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <p>{hour.dateTime}</p>
                <p>{hour.temperature} °C</p>
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
                  <p>Humidity: {hour.humidity} %</p>
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
