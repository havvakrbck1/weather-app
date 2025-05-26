import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Istanbul");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=tr`
      );
      if (!res.ok) throw new Error("Şehir bulunamadı.");

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Konum servisi desteklenmiyor.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=tr`
          );
          if (!res.ok) throw new Error("Konumdan hava durumu alınamadı.");
          const data = await res.json();
          setWeather(data);
          setCity(data.name);
        } catch (err) {
          setError(err.message);
          setWeather(null);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Konum alınamadı.");
        setLoading(false);
      }
    );
  };

  const getWeatherIcon = (main) => {
    switch (main.toLowerCase()) {
      case "clear":
        return "☀️";
      case "clouds":
        return "☁️";
      case "rain":
      case "drizzle":
        return "🌧️";
      case "thunderstorm":
        return "⛈️";
      case "snow":
        return "❄️";
      case "mist":
      case "fog":
        return "🌫️";
      default:
        return "🌈";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city) return;
    fetchWeather(city);
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="app-container">
      {/* Tema Değiştir Butonu */}
      <button
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="theme-toggle"
        title="Tema Değiştir"
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      <h1>Hava Durumu</h1>

      {/* Şehir Arama */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Şehir giriniz..."
        />
        <button type="submit">Ara</button>
      </form>

      {/* Konumdan Al Butonu */}
      <div className="text-center mb-6">
        <button
          onClick={handleGetLocation}
          className="location-button"
        >
          📍 Konumdan Al
        </button>
      </div>

      {/* Yükleniyor, Hata veya Sonuç */}
      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.name}</h2>
          <p>{weather.weather[0].description}</p>
          <p className="weather-icon">{getWeatherIcon(weather.weather[0].main)}</p>
          <p>{Math.round(weather.main.temp)}°C</p>
          <p>Hissedilen: {Math.round(weather.main.feels_like)}°C</p>
          <p>Nem: {weather.main.humidity}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
