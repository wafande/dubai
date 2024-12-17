import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Plus, Minus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface PriceCalculatorProps {
  serviceType: 'yacht' | 'aviation' | 'vehicle';
  basePrice: number;
  currency: string;
  onCalculate?: (total: number) => void;
}

interface PricingRules {
  basePrice: number;
  hourlyRate: number;
  peakSeasonMultiplier: number;
  weekendMultiplier: number;
  guestRate: number;
  maxGuests: number;
  additionalServices: {
    [key: string]: number;
  };
}

const PRICING_RULES: Record<string, PricingRules> = {
  yacht: {
    basePrice: 5000,
    hourlyRate: 1000,
    peakSeasonMultiplier: 1.3,
    weekendMultiplier: 1.2,
    guestRate: 100,
    maxGuests: 12,
    additionalServices: {
      'Catering': 1500,
      'Jet Ski': 800,
      'Professional Photography': 1000,
      'Live Music': 2000,
    },
  },
  aviation: {
    basePrice: 15000,
    hourlyRate: 3000,
    peakSeasonMultiplier: 1.4,
    weekendMultiplier: 1.1,
    guestRate: 200,
    maxGuests: 8,
    additionalServices: {
      'Luxury Ground Transfer': 1000,
      'Onboard Dining': 2000,
      'Concierge Service': 1500,
      'Priority Boarding': 500,
    },
  },
  vehicle: {
    basePrice: 1000,
    hourlyRate: 200,
    peakSeasonMultiplier: 1.2,
    weekendMultiplier: 1.15,
    guestRate: 50,
    maxGuests: 4,
    additionalServices: {
      'Chauffeur': 800,
      'City Tour Guide': 600,
      'Refreshments': 200,
      'WiFi & Entertainment': 100,
    },
  },
};

const PriceCalculator = ({ serviceType, basePrice, currency, onCalculate }: PriceCalculatorProps) => {
  const [date, setDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState(4);
  const [guests, setGuests] = useState(2);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [total, setTotal] = useState(basePrice);
  const [isCalculating, setIsCalculating] = useState(false);

  const rules = PRICING_RULES[serviceType];

  const isPeakSeason = (date: Date) => {
    const month = date.getMonth();
    return month >= 10 || month <= 2; // November to March
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 5 || day === 6; // Friday or Saturday
  };

  const calculatePrice = () => {
    if (!date) return basePrice;

    setIsCalculating(true);
    let calculatedPrice = rules.basePrice;

    // Add duration cost
    calculatedPrice += (duration - 1) * rules.hourlyRate;

    // Apply season and weekend multipliers
    if (isPeakSeason(date)) {
      calculatedPrice *= rules.peakSeasonMultiplier;
    }
    if (isWeekend(date)) {
      calculatedPrice *= rules.weekendMultiplier;
    }

    // Add guest cost
    calculatedPrice += (guests - 1) * rules.guestRate;

    // Add additional services
    selectedServices.forEach(service => {
      calculatedPrice += rules.additionalServices[service];
    });

    return Math.round(calculatedPrice);
  };

  useEffect(() => {
    if (date) {
      const newTotal = calculatePrice();
      setTotal(newTotal);
      onCalculate?.(newTotal);
      setIsCalculating(false);
    }
  }, [date, duration, guests, selectedServices]);

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-bold mb-4">Instant Price Calculator</h3>

      {/* Date Selection */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Select Date</label>
        <DatePicker
          selected={date}
          onChange={(date: Date) => setDate(date)}
          minDate={new Date()}
          className="w-full bg-black/50 border border-gray-800 rounded-lg p-3 text-white"
          placeholderText="Select date"
        />
      </div>

      {/* Duration Selection */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Duration (hours)</label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDuration(Math.max(1, duration - 1))}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold">{duration}</span>
          <button
            onClick={() => setDuration(duration + 1)}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guests Selection */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Number of Guests</label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-xl font-bold">{guests}</span>
          <button
            onClick={() => setGuests(Math.min(rules.maxGuests, guests + 1))}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Additional Services */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Additional Services</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(rules.additionalServices).map(([service, price]) => (
            <button
              key={service}
              onClick={() => {
                setSelectedServices(prev =>
                  prev.includes(service)
                    ? prev.filter(s => s !== service)
                    : [...prev, service]
                );
              }}
              className={`p-3 rounded-lg text-sm text-left transition-colors ${
                selectedServices.includes(service)
                  ? 'bg-white/20'
                  : 'bg-black/50 hover:bg-black/70'
              }`}
            >
              <div className="font-medium">{service}</div>
              <div className="text-sm text-gray-400">+{currency} {price}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Total Price */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="border-t border-gray-800 pt-4 mt-6"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Price:</span>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {isCalculating ? (
                  <span className="animate-pulse">Calculating...</span>
                ) : (
                  `${currency} ${total.toLocaleString()}`
                )}
              </div>
              {date && isPeakSeason(date) && (
                <span className="text-sm text-yellow-500">Peak season rates apply</span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PriceCalculator; 