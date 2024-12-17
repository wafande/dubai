import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { BookingLayout } from './BookingLayout';
import { routes } from '../../../config/routes';
import type { VehicleType } from '../../../types';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
}

const generateTimeSlots = (selectedDate: Date): TimeSlot[] => {
  const today = startOfToday();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const currentHour = new Date().getHours();

  return Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i; // Start from 8 AM
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      available: !isToday || hour > currentHour
    };
  });
};

const DateTimeStep: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const vehicleType = type as VehicleType;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [error, setError] = useState<string>('');

  const timeSlots = generateTimeSlots(selectedDate);
  const maxDate = addDays(new Date(), 90); // Allow booking up to 90 days in advance

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      setError('Please select a time slot');
      return;
    }

    // Store datetime info in session storage
    sessionStorage.setItem('bookingDateTime', JSON.stringify({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime
    }));

    // Navigate to next step
    router.push(routes.booking.step(vehicleType, 'extras'));
  };

  const handleBack = () => {
    router.push(routes.booking.step(vehicleType, 'details'));
  };

  return (
    <BookingLayout currentStep="datetime" vehicleType={vehicleType}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">Select Date & Time</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(maxDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="
                w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
              "
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map(({ time, available }) => (
                <motion.button
                  key={time}
                  type="button"
                  onClick={() => available && handleTimeSelect(time)}
                  className={`
                    px-4 py-2 rounded-lg text-center
                    ${available
                      ? selectedTime === time
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-500'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  whileHover={available ? { scale: 1.02 } : {}}
                  whileTap={available ? { scale: 0.98 } : {}}
                  disabled={!available}
                >
                  {time}
                </motion.button>
              ))}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <motion.button
              type="button"
              onClick={handleBack}
              className="
                px-6 py-2 border border-gray-300 rounded-lg text-gray-600
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/50
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>

            <motion.button
              type="submit"
              className="
                bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold
                hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to Extras
            </motion.button>
          </div>
        </form>
      </motion.div>
    </BookingLayout>
  );
};

export default DateTimeStep; 