import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { BookingLayout } from './BookingLayout';
import { routes } from '../../../config/routes';
import type { VehicleType } from '../../../types';

interface BookingDetails {
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  dateTime: {
    date: string;
    time: string;
  };
  extras: {
    items: string[];
    totalPrice: number;
  };
  payment: {
    status: string;
    amount: number;
    timestamp: string;
  };
  tourPrice: number;
}

const ConfirmationStep: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const vehicleType = type as VehicleType;

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [bookingReference] = useState(() => 
    'BK' + Math.random().toString(36).substr(2, 9).toUpperCase()
  );

  useEffect(() => {
    // Load all booking details from session storage
    const passengerInfo = sessionStorage.getItem('passengerInfo');
    const dateTime = sessionStorage.getItem('bookingDateTime');
    const extras = sessionStorage.getItem('selectedExtras');
    const payment = sessionStorage.getItem('paymentConfirmation');
    const tourData = sessionStorage.getItem('tourData');

    if (passengerInfo && dateTime && payment) {
      setBookingDetails({
        passengerInfo: JSON.parse(passengerInfo),
        dateTime: JSON.parse(dateTime),
        extras: extras ? JSON.parse(extras) : { items: [], totalPrice: 0 },
        payment: JSON.parse(payment),
        tourPrice: tourData ? JSON.parse(tourData).price : 0
      });
    }
  }, []);

  const handleViewBookings = () => {
    router.push('/account/bookings');
  };

  const handleBookAnother = () => {
    // Clear session storage
    sessionStorage.clear();
    // Redirect to tours page
    router.push('/tours');
  };

  if (!bookingDetails) {
    return (
      <BookingLayout currentStep="confirmation" vehicleType={vehicleType}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout currentStep="confirmation" vehicleType={vehicleType}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Success Message */}
        <div className="bg-green-50 rounded-xl p-8 text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-green-600">
            Your booking reference is: <span className="font-mono font-bold">{bookingReference}</span>
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-amber-500 text-white px-6 py-4">
            <h3 className="text-xl font-semibold">Booking Details</h3>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Passenger Information */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Passenger Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {bookingDetails.passengerInfo.firstName} {bookingDetails.passengerInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{bookingDetails.passengerInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{bookingDetails.passengerInfo.phone}</p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Tour Schedule</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(bookingDetails.dateTime.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{bookingDetails.dateTime.time}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tour Price</span>
                  <span className="font-medium">AED {bookingDetails.tourPrice}</span>
                </div>
                {bookingDetails.extras.totalPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extras</span>
                    <span className="font-medium">AED {bookingDetails.extras.totalPrice}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Paid</span>
                    <span className="font-bold text-amber-600">
                      AED {bookingDetails.payment.amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleViewBookings}
            className="
              px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold
              hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View My Bookings
          </motion.button>

          <motion.button
            onClick={handleBookAnother}
            className="
              px-6 py-3 border border-amber-500 text-amber-500 rounded-lg font-semibold
              hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-500/50
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Another Tour
          </motion.button>
        </div>

        {/* Email Confirmation Notice */}
        <motion.p
          className="text-center text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A confirmation email has been sent to {bookingDetails.passengerInfo.email}
        </motion.p>
      </motion.div>
    </BookingLayout>
  );
};

export default ConfirmationStep; 