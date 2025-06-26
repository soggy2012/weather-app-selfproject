import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "./index.css"

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(""); // Will be filled by search or geolocation
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);

  const API_KEY = "bd5726984be5319e8df3a05f15913371";

  const fetchWeatherByCity = (cityName) => {

    // Step 1: Send a GET request to the OpenWeather API using the city name
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`)
      .then((res) => res.json()) // Step 2: Convert the response to JSON
      .then((data) => {

        // Step 3: Check if the API returned an error (e.g. city not found)
        if (data.cod !== 200) throw new Error("City not found");

        // Step 4: If the API call was successful, update the weather state
        setWeather(data);

        // Step 5: Update the current city state to reflect the fetched result
        setCity(data.name);

        setError(null); // Clear any previous errors
      })
      .catch(() => {
        // Step 7: If any error occurs (e.g. bad city name, network error), show an error message
        setError("Error fetching weather data. Please try again.");

        setWeather(null); // Clear the weather data on error
      });
  };

  const fetchWeatherByGeolocation = (lat, lon) => {

    // Call API using latitude and longitude
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setCity(data.name);
        setInput(data.name); // Set input to the city name from the geolocation data
        setError(null); // Clear any previous errors
      })
      .catch(() => {
        setError("Error fetching weather data. Please try again.");
        setWeather(null); // Clear the weather data on error
      });
  };

  const getBackgroundClass = (mainWeather) => {
    switch (mainWeather) {
      case 'Clear':
        return 'bg-gradient-to-b from-blue-300 to-yellow-200';
      case 'Clouds':
        return 'bg-gradient-to-b from-gray-300 to-gray-500';
      case 'Rain':
      case 'Drizzle':
        return 'bg-gradient-to-b from-gray-600 to-blue-700';
      case 'Thunderstorm':
        return 'bg-gradient-to-b from-gray-800 to-purple-800';
      case 'Snow':
        return 'bg-gradient-to-b from-white to-blue-200';
      case 'Mist':
      case 'Fog':
        return 'bg-gradient-to-b from-gray-200 to-gray-400';
      case 'Night': // if you detect night manually
        return 'bg-gradient-to-b from-gray-900 to-gray-700';
      default:
        return 'bg-blue-100'; // fallback
    }
  };

  const getWeatherIconClass = (mainWeather) => {
    switch (mainWeather) {
      case 'Clear':
        return 'fa-sun text-yellow-400';
      case 'Clouds':
        return 'fa-cloud text-gray-400';
      case 'Rain':
      case 'Drizzle':
        return 'fa-cloud-rain text-blue-600';
      case 'Thunderstorm':
        return 'fa-bolt text-yellow-600';
      case 'Snow':
        return 'fa-snowflake text-blue-300';
      case 'Mist':
      case 'Fog':
        return 'fa-smog text-gray-300';
      default:
        return 'fa-smog text-gray-300';
    }
};


  useEffect(() => { 
    //  Check if the user has allowed geolocation access
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByGeolocation(latitude, longitude);
      }, () => {
        // If geolocation fails, default to Frankfurt
        fetchWeatherByCity("Frankfurt");
      });
    } else {
      // If geolocation is not supported, default to Frankfurt
      fetchWeatherByCity("Frankfurt");
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      fetchWeatherByCity(input.trim());
      setInput(""); // Clear the input field after search
    }
  }

  return (
    <>
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${weather ? getBackgroundClass(weather.weather[0].main) : 'bg-blue-100'}`}>
      <form onSubmit={handleSearch} className="mb-12">
        <div className='flex overflow-hidden rounded-lg border border-gray-300 shadow-sm'>
          <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter city name"
          className="p-2 w-43 focus:outline-none"
        />
        <button
          type="submit"
          className="p-2  hover:bg-gray-100 text-gray-700 flex items-center justify-center"
        >
          <i className="fa-solid fa-magnifying-glass-location"></i>
        </button>
        </div>
      </form>

      {weather && (
      <>
        {/* Weather icon above city name */}
        <i className={`fa-solid ${getWeatherIconClass(weather.weather[0].main)} text-5xl mb-2`}></i>
        <h1 className="text-2xl font-bold">
          {weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}
        </h1>
      </>
      )}

      {error && <p className="text-red-200 mb-4">{error}</p>}

      {weather ? (
        <div className="mt-4 p-6  flex flex-col rounded-lg items-center">
          <p className="text-lg">{weather.main.temp} °C</p>
          <p className="text-lg">Weather: {weather.weather[0].description}</p>
          <p className="text-lg">Humidity: {weather.main.humidity}%</p>
          <p className="text-lg">Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      ) : (
        <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg">Loading weather data...</p>
        </div>
      )} {}
    </div>
  </>
  )
} 

export default App
