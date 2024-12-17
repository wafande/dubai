import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWeather } from '../../services/weather';

interface WeatherDisplayProps {
  className?: string;
  showTime?: boolean;
  position?: 'fixed' | 'absolute' | 'relative';
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  className = '',
  showTime = true,
  position = 'fixed'
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [time, setTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeather();
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000); // Update every 30 minutes

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
    fixed: 'fixed top-8 right-8',
    absolute: 'absolute top-8 right-8',
    relative: 'relative'
  };

  return (
    <div className={`${positionClasses[position]} z-40 flex flex-col items-end space-y-2 ${className}`}>
      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-gray-900/60 backdrop-blur-md rounded-lg px-4 py-3
          text-white shadow-lg cursor-pointer
          hover:bg-gray-900/70 transition-all duration-300
          ${isExpanded ? 'w-64' : 'w-auto'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Basic Info */}
          <div className="flex items-center space-x-3">
            <img
              src={weather.icon}
              alt={weather.condition}
              className="w-8 h-8"
              loading="lazy"
            />
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-semibold">{weather.temperature}°C</span>
                <span className="ml-2 text-sm text-gray-300">{weather.condition}</span>
              </div>
              <div className="text-xs text-gray-300">Dubai, UAE</div>
            </div>
          </div>
        </div>

        {/* Extended Info */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-400">Humidity</div>
                  <div>{weather.humidity}%</div>
                </div>
                <div>
                  <div className="text-gray-400">Wind Speed</div>
                  <div>{weather.windSpeed} km/h</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Time Display */}
      {showTime && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 backdrop-blur-md rounded-lg px-4 py-2 text-white shadow-lg"
        >
          <span className="text-sm font-medium">
            {time.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </motion.div>
      )}
    </div>
  );
}; 