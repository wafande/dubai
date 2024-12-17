import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { routes, BookingRouteParams } from '../../../config/routes';
import type { VehicleType } from '../../../types';

interface BookingLayoutProps {
  children: React.ReactNode;
  currentStep: BookingRouteParams['step'];
  vehicleType: VehicleType;
}

const steps: BookingRouteParams['step'][] = [
  'details',
  'datetime',
  'extras',
  'payment',
  'confirmation'
];

const stepLabels = {
  details: 'Tour Details',
  datetime: 'Date & Time',
  extras: 'Extras',
  payment: 'Payment',
  confirmation: 'Confirmation'
};

export const BookingLayout: React.FC<BookingLayoutProps> = ({
  children,
  currentStep,
  vehicleType
}) => {
  const router = useRouter();
  const currentStepIndex = steps.indexOf(currentStep);

  const handleStepClick = (step: BookingRouteParams['step']) => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex <= currentStepIndex) {
      router.push(routes.booking.step(vehicleType, step));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                {/* Step Circle */}
                <motion.button
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    ${index <= currentStepIndex
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                    ${index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  onClick={() => handleStepClick(step)}
                  whileHover={index <= currentStepIndex ? { scale: 1.05 } : {}}
                  whileTap={index <= currentStepIndex ? { scale: 0.95 } : {}}
                >
                  {index < currentStepIndex ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  <div className="absolute -bottom-6 whitespace-nowrap text-sm font-medium text-gray-600">
                    {stepLabels[step]}
                  </div>
                </motion.button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        background: `linear-gradient(to right, 
                          ${index < currentStepIndex ? '#F59E0B' : '#E5E7EB'} 0%, 
                          ${index + 1 <= currentStepIndex ? '#F59E0B' : '#E5E7EB'} 100%
                        )`
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}; 