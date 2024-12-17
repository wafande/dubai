import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";
import { bookingService } from '../services/bookingService';
import type { BookingFormData } from '../types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: {
    id: string;
    name: string;
    sharingPrice: number;
    privatePrice: number;
    duration: string;
    type: 'helicopter' | 'yacht';
  };
}

export function BookingModal({ isOpen, onClose, tour }: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    date: null,
    isPrivate: false,
    email: '',
    name: '',
    phone: '',
    specialRequests: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const price = formData.isPrivate ? tour.privatePrice : tour.sharingPrice;

  const handlePaypalSuccess = async (details: any) => {
    setIsProcessing(true);
    try {
      await bookingService.createBooking(
        formData,
        {
          id: tour.id,
          name: tour.name,
          type: tour.type
        },
        price,
        details.id
      );
      
      toast.success('Booking confirmed! Check your email for details.');
      onClose();
      
      // In a real app, you would send an email here
      console.log('Booking email would be sent to:', formData.email);
    } catch (error) {
      toast.error('There was an error processing your booking');
      console.error('Booking error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.date &&
      formData.email &&
      formData.name &&
      formData.phone
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Book {tour.name}
                </Dialog.Title>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Select Date
                    </label>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({ ...formData, date })}
                      minDate={new Date()}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholderText="Select your preferred date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                      placeholder="Any special requests or requirements?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Booking Type
                    </label>
                    <div className="mt-2 space-x-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPrivate: false })}
                        className={`px-4 py-2 rounded-md ${
                          !formData.isPrivate
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Sharing (${tour.sharingPrice})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isPrivate: true })}
                        className={`px-4 py-2 rounded-md ${
                          formData.isPrivate
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Private (${tour.privatePrice})
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Duration: {tour.duration}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      Total: ${price}
                    </p>
                  </div>

                  {isFormValid() && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4"
                    >
                      <PayPalButtons
                        style={{ layout: "horizontal" }}
                        disabled={isProcessing}
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                description: `${tour.name} - ${formData.isPrivate ? 'Private' : 'Sharing'} Tour`,
                                amount: {
                                  value: price.toString()
                                }
                              }
                            ]
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const details = await actions.order?.capture();
                          await handlePaypalSuccess(details);
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 