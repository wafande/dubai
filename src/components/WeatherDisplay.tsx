import { useState, useEffect } from 'react';
import { getWeather } from '../services/weather';
import { motion } from 'framer-motion';

interface WeatherDisplayProps {
  className?: string;
  showTime?: boolean;
  position?: 'fixed' | 'absolute' | 'relative';
}

const WeatherDisplay = ({ className = '', showTime = true, position = 'fixed' }: WeatherDisplayProps) => {
  const [weather, setWeather] = useState<{
    temperature: number;
    condition: string;
  } | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeather();
        setWeather({
          temperature: data.temperature,
          condition: data.condition,
        });
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    // Update time every second if showTime is true
    let timeInterval: NodeJS.Timer | undefined;
    if (showTime) {
      timeInterval = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }

    return () => {
      clearInterval(weatherInterval);
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [showTime]);

  if (!weather) return null;

  const positionClasses = {
    fixed: 'fixed top-32 right-8',
    absolute: 'absolute top-32 right-8',
    relative: 'relative',
  };

  return (
    <div className={`${positionClasses[position]} z-40 flex flex-col items-end space-y-2 ${className}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-2 bg-gray-900/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-white shadow-lg"
      >
        <span className="flex items-center text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Dubai • {weather.temperature}°C • {weather.condition}
        </span>
      </motion.div>
      {showTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 bg-gray-900/60 backdrop-blur-md rounded-lg px-3 py-1.5 text-white shadow-lg"
        >
          <span className="text-sm">
            {time.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default WeatherDisplay; 