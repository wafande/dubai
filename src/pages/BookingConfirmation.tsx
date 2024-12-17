import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Calendar, Clock, Users, DollarSign, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { bookingService, Booking } from '../services/BookingService';
import { paymentService } from '../services/PaymentService';

export function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(location.state?.booking || null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Get enabled payment gateways
      const enabledGateways = paymentService.getEnabledGateways();
      if (enabledGateways.length === 0) {
        throw new Error('No payment gateways are enabled');
      }

      // Use the first enabled gateway (in a real app, you'd let the user choose)
      const gateway = enabledGateways[0];

      // Create a payment intent
      const intent = await paymentService.createPaymentIntent(
        booking.totalPrice,
        gateway.id,
        {
          bookingId: booking.id,
          vehicleId: booking.vehicleId,
          userEmail: booking.userEmail,
        }
      );

      // Process the payment (in a real app, this would integrate with the gateway's SDK)
      await paymentService.processPayment(intent.id, 'card');

      // Update the booking status
      const updatedBooking = await bookingService.updateBookingStatus(
        booking.id,
        'confirmed',
        'paid'
      );
      setBooking(updatedBooking);
      toast.success('Payment processed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-white">Booking Confirmation</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">Booking ID:</span>
                <span className="text-sm font-mono bg-white/20 rounded px-2 py-1 text-white">
                  {booking.id}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Vehicle Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {booking.vehicleName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>
                      {booking.startTime} - {booking.endTime} ({booking.duration} hours)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>{booking.passengers} passengers</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign className="h-5 w-5" />
                    <span>${booking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Name:</span> {booking.userName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {booking.userEmail}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {booking.userPhone}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Special Requests
                  </h3>
                  <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                </div>
              )}

              {/* Status */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Status</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : booking.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  {booking.paymentStatus === 'pending' && (
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Return to Home
              </button>
              {booking.status === 'confirmed' && (
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Booking Confirmed</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 