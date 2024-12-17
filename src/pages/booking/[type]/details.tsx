import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { BookingLayout } from './BookingLayout';
import { routes } from '../../../config/routes';
import type { VehicleType } from '../../../types';

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

const TourDetailsStep: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const vehicleType = type as VehicleType;

  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Partial<PassengerInfo>>({});

  const validateForm = () => {
    const newErrors: Partial<PassengerInfo> = {};
    
    if (!passengerInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!passengerInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!passengerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!passengerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPassengerInfo(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof PassengerInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Store passenger info in session storage for later steps
      sessionStorage.setItem('passengerInfo', JSON.stringify(passengerInfo));
      // Navigate to next step
      router.push(routes.booking.step(vehicleType, 'datetime'));
    }
  };

  return (
    <BookingLayout currentStep="details" vehicleType={vehicleType}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">Passenger Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={passengerInfo.firstName}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500/50
                  ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
                `}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-500">
                  {errors.firstName}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={passengerInfo.lastName}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500/50
                  ${errors.lastName ? 'border-red-500' : 'border-gray-300'}
                `}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-500">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={passengerInfo.email}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500/50
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}
                `}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={passengerInfo.phone}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500/50
                  ${errors.phone ? 'border-red-500' : 'border-gray-300'}
                `}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                placeholder="+971"
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={passengerInfo.specialRequests}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500/50"
              placeholder="Any special requirements or preferences?"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              className="
                bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold
                hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to Date & Time
            </motion.button>
          </div>
        </form>
      </motion.div>
    </BookingLayout>
  );
};

export default TourDetailsStep; 