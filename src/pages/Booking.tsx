import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';
import type { BookingFormData } from '../types/forms';

type ServiceType = 'yacht' | 'aviation' | 'vehicle';

interface FormError {
  field: keyof BookingFormData | 'submit';
  message: string;
}

export const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceType = searchParams.get('service') as ServiceType || 'yacht';
  const itemId = searchParams.get('id');

  const [bookingDetails, setBookingDetails] = useState<BookingFormData>({
    serviceType,
    date: '',
    time: '',
    duration: '',
    guests: 1,
    additionalServices: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<FormError | null>(null);

  // Update service type when URL param changes
  useEffect(() => {
    setBookingDetails(prev => ({
      ...prev,
      serviceType,
    }));
  }, [serviceType]);

  const validateForm = (): FormError | null => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const selectedDate = new Date(bookingDetails.date);

    if (!bookingDetails.date) {
      return { field: 'date', message: 'Please select a date' };
    }
    if (selectedDate < tomorrow) {
      return { field: 'date', message: 'Date must be at least 1 day in advance' };
    }
    if (!bookingDetails.time) {
      return { field: 'time', message: 'Please select a time' };
    }
    if (!bookingDetails.duration) {
      return { field: 'duration', message: 'Please select a duration' };
    }
    if (bookingDetails.guests < 1) {
      return { field: 'guests', message: 'Number of guests must be at least 1' };
    }
    if (bookingDetails.serviceType === 'yacht' && bookingDetails.guests > 30) {
      return { field: 'guests', message: 'Maximum 30 guests allowed for yacht charters' };
    }
    if (bookingDetails.serviceType === 'aviation' && bookingDetails.guests > 15) {
      return { field: 'guests', message: 'Maximum 15 guests allowed for private flights' };
    }
    if (bookingDetails.serviceType === 'vehicle' && bookingDetails.guests > 4) {
      return { field: 'guests', message: 'Maximum 4 guests allowed per vehicle' };
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 1 : value,
    }));
    if (error?.field === name) {
      setError(null);
    }
  };

  const handleCheckboxChange = (service: string) => {
    setBookingDetails(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit booking
      const response = await apiService.submitBooking(bookingDetails);
      
      if (response.success && response.data) {
        setIsSubmitted(true);

        // Send confirmation email
        await apiService.sendEmail({
          to: 'user@example.com', // TODO: Get user's email from form or context
          templateId: 'booking-confirmation',
          data: {
            bookingId: response.data.bookingId,
            serviceType: bookingDetails.serviceType,
            date: bookingDetails.date,
            time: bookingDetails.time,
            duration: bookingDetails.duration,
            guests: bookingDetails.guests,
            additionalServices: bookingDetails.additionalServices,
            totalAmount: response.data.totalAmount,
            currency: response.data.currency,
          },
        });
        
        // Redirect to confirmation page after 2 seconds
        setTimeout(() => {
          navigate('/booking/confirmation', { 
            state: { 
              booking: bookingDetails,
              bookingId: response.data.bookingId,
              totalAmount: response.data.totalAmount,
              currency: response.data.currency,
              status: response.data.status,
            }
          });
        }, 2000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError({ field: 'submit', message: err.message });
      } else {
        setError({ field: 'submit', message: 'An unexpected error occurred while processing your booking' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const additionalServiceOptions = {
    yacht: [
      'Catering Service',
      'Professional Photography',
      'Water Sports Equipment',
      'Live Music',
      'Decoration Package',
    ],
    aviation: [
      'Ground Transportation',
      'Inflight Catering',
      'VIP Terminal Access',
      'Hotel Booking',
      'Concierge Service',
    ],
    vehicle: [
      'Chauffeur Service',
      'Airport Transfer',
      'Tour Guide',
      'Extended Hours',
      'Special Occasion Setup',
    ],
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh]">
        <div className="absolute inset-0">
          <img
            src={
              serviceType === 'yacht'
                ? 'https://images.unsplash.com/photo-1621277224630-81321e68c03e'
                : serviceType === 'aviation'
                ? 'https://images.unsplash.com/photo-1540962351504-03099e0a754b'
                : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70'
            }
            alt="Luxury service"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Book Your Experience
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-gray-300"
            >
              {serviceType === 'yacht'
                ? 'Reserve your luxury yacht charter'
                : serviceType === 'aviation'
                ? 'Schedule your private flight'
                : 'Book your luxury vehicle'}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-900 rounded-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-300 mb-2">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={bookingDetails.serviceType}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-colors"
                    aria-label="Select service type"
                  >
                    <option value="yacht">Yacht Charter</option>
                    <option value="aviation">Private Aviation</option>
                    <option value="vehicle">Luxury Vehicle</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    min="1"
                    value={bookingDetails.guests}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg bg-black border ${
                      error?.field === 'guests' ? 'border-red-500' : 'border-white/20'
                    } text-white focus:outline-none focus:border-white transition-colors`}
                    aria-label="Enter number of guests"
                    aria-invalid={error?.field === 'guests' ? true : false}
                    aria-describedby={error?.field === 'guests' ? 'guests-error' : undefined}
                  />
                  {error?.field === 'guests' && (
                    <p id="guests-error" className="mt-2 text-sm text-red-500 flex items-center" role="alert">
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {error.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={bookingDetails.date}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-lg bg-black border ${
                      error?.field === 'date' ? 'border-red-500' : 'border-white/20'
                    } text-white focus:outline-none focus:border-white transition-colors`}
                    aria-label="Select booking date"
                    aria-invalid={error?.field === 'date' ? true : false}
                    aria-describedby={error?.field === 'date' ? 'date-error' : undefined}
                  />
                  {error?.field === 'date' && (
                    <p id="date-error" className="mt-2 text-sm text-red-500 flex items-center" role="alert">
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {error.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={bookingDetails.time}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg bg-black border ${
                      error?.field === 'time' ? 'border-red-500' : 'border-white/20'
                    } text-white focus:outline-none focus:border-white transition-colors`}
                    aria-label="Select booking time"
                    aria-invalid={error?.field === 'time' ? true : false}
                    aria-describedby={error?.field === 'time' ? 'time-error' : undefined}
                  />
                  {error?.field === 'time' && (
                    <p id="time-error" className="mt-2 text-sm text-red-500 flex items-center" role="alert">
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {error.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={bookingDetails.duration}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-lg bg-black border ${
                      error?.field === 'duration' ? 'border-red-500' : 'border-white/20'
                    } text-white focus:outline-none focus:border-white transition-colors`}
                    aria-label="Select booking duration"
                    aria-invalid={error?.field === 'duration' ? true : false}
                    aria-describedby={error?.field === 'duration' ? 'duration-error' : undefined}
                  >
                    <option value="">Select duration</option>
                    <option value="2">2 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="24">24 Hours</option>
                  </select>
                  {error?.field === 'duration' && (
                    <p id="duration-error" className="mt-2 text-sm text-red-500 flex items-center" role="alert">
                      <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                      {error.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Services */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Additional Services
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Additional services">
                  {additionalServiceOptions[bookingDetails.serviceType].map((service) => (
                    <label
                      key={service}
                      className="flex items-center space-x-3 p-4 rounded-lg bg-black border border-white/20 cursor-pointer hover:border-white transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={bookingDetails.additionalServices.includes(service)}
                        onChange={() => handleCheckboxChange(service)}
                        disabled={isSubmitting}
                        className="w-4 h-4 rounded border-white/20"
                        aria-label={`Select ${service}`}
                      />
                      <span className="text-gray-300">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error?.field === 'submit' && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg" role="alert">
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    {error.message}
                  </p>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-white text-black px-8 py-4 rounded-lg text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors relative overflow-hidden ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center"
                  >
                    Processing...
                  </motion.span>
                ) : isSubmitted ? (
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 mr-2" aria-hidden="true" />
                    Booking Confirmed
                  </motion.span>
                ) : (
                  'Proceed to Confirmation'
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}; 