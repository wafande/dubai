interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const DUBAI_COORDINATES = {
  lat: 25.2048,
  lon: 55.2708,
};

// Map OpenMeteo weather codes to conditions and icons
const weatherCodeMap: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '01d' },
  1: { condition: 'Partly Cloudy', icon: '02d' },
  2: { condition: 'Cloudy', icon: '03d' },
  3: { condition: 'Overcast', icon: '04d' },
  45: { condition: 'Foggy', icon: '50d' },
  48: { condition: 'Foggy', icon: '50d' },
  51: { condition: 'Light Rain', icon: '09d' },
  53: { condition: 'Rain', icon: '09d' },
  55: { condition: 'Heavy Rain', icon: '09d' },
  61: { condition: 'Light Rain', icon: '10d' },
  63: { condition: 'Rain', icon: '10d' },
  65: { condition: 'Heavy Rain', icon: '10d' },
  71: { condition: 'Snow', icon: '13d' },
  73: { condition: 'Snow', icon: '13d' },
  75: { condition: 'Heavy Snow', icon: '13d' },
  95: { condition: 'Thunderstorm', icon: '11d' },
  96: { condition: 'Thunderstorm', icon: '11d' },
  99: { condition: 'Thunderstorm', icon: '11d' },
};

export const getWeather = async (): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${DUBAI_COORDINATES.lat}&longitude=${DUBAI_COORDINATES.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    const weatherCode = data.current.weather_code;
    const weatherInfo = weatherCodeMap[weatherCode] || { condition: 'Clear', icon: '01d' };
    
    return {
      temperature: Math.round(data.current.temperature_2m),
      condition: weatherInfo.condition,
      icon: `https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`,
      humidity: Math.round(data.current.relative_humidity_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      temperature: 32,
      condition: 'Sunny',
      icon: 'https://openweathermap.org/img/wn/01d@2x.png',
      humidity: 65,
      windSpeed: 5.2,
    };
  }
}; 