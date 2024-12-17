import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MessageSquare, Loader } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { bookingService, BookingSlot } from '../services/BookingService';

interface BookingFormProps {
  vehicle: {
    id: string;
    name: string;
    type: 'helicopter' | 'yacht' | 'luxury-car' | 'private-jet';
    pricePerHour: number;
    capacity: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookingForm({ vehicle, onSuccess, onCancel }: BookingFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [passengers, setPassengers] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Calculate the next 30 days for date selection
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const slots = await bookingService.getAvailableSlots(vehicle.id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return vehicle.pricePerHour * duration;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const booking = await bookingService.createBooking(
        {
          vehicleId: vehicle.id,
          date: selectedDate,
          startTime: selectedTime,
          duration,
          passengers,
          specialRequests,
          userDetails,
        },
        vehicle
      );

      toast.success('Booking created successfully');
      onSuccess?.();
      navigate('/booking/confirmation', { state: { booking } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return selectedDate && selectedTime && duration > 0;
      case 2:
        return passengers > 0 && passengers <= vehicle.capacity;
      case 3:
        return (
          userDetails.name.trim() !== '' &&
          userDetails.email.trim() !== '' &&
          userDetails.phone.trim() !== ''
        );
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= i
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i}
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > i ? 'bg-amber-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Select Time</span>
          <span className="text-sm text-gray-600">Passengers</span>
          <span className="text-sm text-gray-600">Details</span>
        </div>
      </div>

      {/* Step 1: Date and Time Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="">Select a date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </option>
              ))}
            </select>
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <div className="mt-1 grid grid-cols-4 gap-2">
                {isLoading ? (
                  <div className="col-span-4 flex justify-center py-4">
                    <Loader className="animate-spin h-6 w-6 text-amber-500" />
                  </div>
                ) : (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTime(slot.startTime)}
                      disabled={!slot.isAvailable}
                      className={`p-2 text-sm rounded-md ${
                        selectedTime === slot.startTime
                          ? 'bg-amber-500 text-white'
                          : slot.isAvailable
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTime && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                {[1, 2, 3, 4, 6, 8].map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} hour{hours > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2: Passengers */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Passengers (Max: {vehicle.capacity})
            </label>
            <input
              type="number"
              min={1}
              max={vehicle.capacity}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Special Requests (Optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              placeholder="Any special requirements or requests..."
            />
          </div>
        </motion.div>
      )}

      {/* Step 3: User Details */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={userDetails.name}
              onChange={(e) =>
                setUserDetails({ ...userDetails, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={userDetails.phone}
              onChange={(e) =>
                setUserDetails({ ...userDetails, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          {/* Booking Summary */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Vehicle:</span> {vehicle.name}
              </p>
              <p>
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </p>
              <p>
                <span className="font-medium">Time:</span> {selectedTime}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {duration} hour
                {duration > 1 ? 's' : ''}
              </p>
              <p>
                <span className="font-medium">Passengers:</span> {passengers}
              </p>
              <p>
                <span className="font-medium">Total Price:</span> $
                {calculateTotalPrice().toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => (step === 1 ? onCancel?.() : setStep(step - 1))}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={() => (step === 3 ? handleSubmit() : setStep(step + 1))}
          disabled={!isStepValid() || isLoading}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : step === 3 ? (
            'Confirm Booking'
          ) : (
            'Next'
          )}
        </button>
      </div>
    </div>
  );
}