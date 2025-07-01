import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "./index.css"
import "@fontsource/nunito";

function App() {
  const [weather, setWeather] = useState(null); // Store weather data
  const [city, setCity] = useState(""); // Store city name
  const [input, setInput] = useState("");  // Store user input for city search
  const [error, setError] = useState(null); // Store error messages
  const [isFocused, setIsFocused] = useState(false); // Track if the input field is focused
  const [forecast, setForecast] = useState([]); // Store 5-day weather forecast

  const API_KEY = import.meta.env.VITE_API_KEY; //API key (read from .env file)


  // Function to fetch weather data by city name
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

  // Function to fetch weather data by geolocation (latitude and longitude)
  const fetchWeatherByGeolocation = (lat, lon) => {

    // Call API using latitude and longitude
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setCity(data.name);
        setError(null); // Clear any previous errors
        fetchForecast(data.name); // Fetch the forecast for the current city
      })
      .catch(() => {
        setError("Error fetching weather data. Please try again.");
        setWeather(null); // Clear the weather data on error
      });
  };

  // Function to extract daily forecast from the 5-day forecast data
  const extractDailyForecast = (list) => {
    const filtered = list.filter(item => item.dt_txt.includes("12:00:00"));
    return filtered.slice(0, 5); // next 5 days
  };

  // Function to fetch the 5-day weather forecast for a given city
  const fetchForecast = (cityName) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`)
      .then((res) => res.json())
      .then((data) => {
        const daily = extractDailyForecast(data.list);
        setForecast(daily);
      });
  };

  // Function to determine the background class based on the main weather condition
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
      case 'Night': 
        return 'bg-gradient-to-b from-gray-900 to-gray-700';
      default:
        return 'bg-blue-100'; 
    }
  };

  // Function to get the appropriate weather icon class based on the main weather condition
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

  // useEffect to fetch weather data based on geolocation when the component mounts
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

  // Function to handle the search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      fetchWeatherByCity(input.trim());  // Fetch weather for the searched city
      fetchForecast(input.trim()); // Fetch forecast for the searched city
      setInput(""); // Clear the input field after search
    }
  }

  return (
    <>
    <div className={`min-h-screen flex flex-col items-center justify-center font-nunito transition-all duration-500 text-white  ${weather ? getBackgroundClass(weather.weather[0].main) : 'bg-blue-100'}`}>
      <form onSubmit={handleSearch} className="mb-12 mt-5">
        <div className='flex overflow-hidden rounded-lg border text-gray-700 border-gray-300 shadow-sm bg-[rgba(255,255,255,0.5)]'>
          <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isFocused ?"": "Enter city name or district"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="p-2 w-55 focus:outline-none"
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
        <div className="flex flex-col items-center mb-6 gap-6 mt-12">
          <i className={`fa-solid ${getWeatherIconClass(weather.weather[0].main)} text-8xl mb-2`}></i>
          <p className="text-5xl">{Math.round(weather.main.temp)} 
            <span className='text-2xl font-normal'>°C</span></p>
          <p className="text-lg capitalize">{weather.weather[0].description}</p>
          <h1 className="">
          {weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ""}
        </h1>
        </div>
        
      </>
      )}

      {error && <p className="text-red-200 mb-4">{error}</p>}

      {weather ? (
        <div className="mt-24 px-6 w-full max-w-sm">
          <div className="bg-[rgba(112,134,179,0.2)] rounded-xl shadow-md p-4 flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="">Humidity:</span>
              <span>{weather.main.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="">Wind Speed:</span>
              <span>{weather.wind.speed} m/s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg">Loading weather data...</p>
        </div>
      )}

      {forecast.length > 0 && (
        
        <div className="mt-12 mb-12 px-6 max-w-md w-full md:max-w-5xl">


          <div className="bg-[rgba(112,134,179,0.2)] rounded-xl shadow-md overflow-hidden">
            <p className="text-l mx-3 px-5 py-2 border-b border-white">5-Day Forecast</p>
            <div className="flex flex-col md:flex-row md:justify-between">
              {forecast.map((day, idx) => {
              const date = new Date(day.dt_txt);
              const isTomorrow = idx === 0;
              const dayLabel = isTomorrow
                ? "Tomorrow"
                : date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

              return (
                <div
                  key={idx}
                  className=" text-white mx-3 px-5 py-1 flex items-center border-b border-white/40 md:border-b-0 md:border-r last:border-r-0 md:flex-col md:items-center md:w-full md:justify-center"
                >
                  <p className="text-sm font-medium w-24 md:w-[5.5rem] text-center leading-tight">{dayLabel}</p>
                  <i className={`fa-solid  ${getWeatherIconClass(day.weather[0].main)} text-xl my-2 w-6 text-center md:w-14 `}></i>
                  <p className="text-md w-20 text-right md:w-[2rem]">{Math.round(day.main.temp_max)}°C</p>
                  <p className="text-sm opacity-80 w-20 text-right md:w-[2rem]">{Math.round(day.main.temp_min)}°C</p>
                </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  )
} 

export default App
