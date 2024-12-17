import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { BookingLayout } from './BookingLayout';
import { routes } from '../../../config/routes';
import type { VehicleType } from '../../../types';

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

interface BookingSummary {
  tourPrice: number;
  extrasTotal: number;
  total: number;
}

const PaymentStep: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const vehicleType = type as VehicleType;

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    tourPrice: 0,
    extrasTotal: 0,
    total: 0
  });

  const [errors, setErrors] = useState<Partial<PaymentInfo>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Load booking summary from session storage
  useEffect(() => {
    const tourData = sessionStorage.getItem('tourData');
    const extrasData = sessionStorage.getItem('selectedExtras');

    if (tourData && extrasData) {
      const tour = JSON.parse(tourData);
      const extras = JSON.parse(extrasData);

      setBookingSummary({
        tourPrice: tour.price || 0,
        extrasTotal: extras.totalPrice || 0,
        total: (tour.price || 0) + (extras.totalPrice || 0)
      });
    }
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 3);
    }

    setPaymentInfo(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name as keyof PaymentInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<PaymentInfo> = {};
    
    if (!paymentInfo.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!paymentInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = paymentInfo.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    if (!paymentInfo.cvv.match(/^\d{3}$/)) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }
    
    if (!paymentInfo.name.trim()) {
      newErrors.name = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store payment confirmation in session storage
      sessionStorage.setItem('paymentConfirmation', JSON.stringify({
        status: 'success',
        amount: bookingSummary.total,
        timestamp: new Date().toISOString()
      }));

      // Navigate to confirmation page
      router.push(routes.booking.step(vehicleType, 'confirmation'));
    } catch (error) {
      console.error('Payment failed:', error);
      // Handle payment error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push(routes.booking.step(vehicleType, 'extras'));
  };

  return (
    <BookingLayout currentStep="payment" vehicleType={vehicleType}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-amber-500/50
                    ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry Date and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentInfo.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:ring-2 focus:ring-amber-500/50
                      ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}
                    `}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentInfo.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={3}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:ring-2 focus:ring-amber-500/50
                      ${errors.cvv ? 'border-red-500' : 'border-gray-300'}
                    `}
                  />
                  {errors.cvv && (
                    <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={paymentInfo.name}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-amber-500/50
                    ${errors.name ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="
                    px-6 py-2 border border-gray-300 rounded-lg text-gray-600
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/50
                  "
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                >
                  Back
                </motion.button>

                <motion.button
                  type="submit"
                  className={`
                    bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold
                    hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Complete Payment'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tour Price</span>
                <span className="font-medium">AED {bookingSummary.tourPrice}</span>
              </div>
              
              {bookingSummary.extrasTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Extras</span>
                  <span className="font-medium">AED {bookingSummary.extrasTotal}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-amber-600">
                    AED {bookingSummary.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure payment processing
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </BookingLayout>
  );
};

export default PaymentStep; 