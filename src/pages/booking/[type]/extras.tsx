import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { BookingLayout } from './BookingLayout';
import { routes } from '../../../config/routes';
import type { VehicleType } from '../../../types';

interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const vehicleExtras: Record<VehicleType, Extra[]> = {
  helicopter: [
    {
      id: 'photo',
      name: 'Professional Photography',
      description: 'High-quality aerial photos of your tour',
      price: 299,
      image: '/images/extras/photo.jpg'
    },
    {
      id: 'champagne',
      name: 'Champagne Service',
      description: 'Premium champagne served during the flight',
      price: 199,
      image: '/images/extras/champagne.jpg'
    },
    {
      id: 'pickup',
      name: 'Hotel Pickup',
      description: 'Luxury vehicle transfer from your hotel',
      price: 149,
      image: '/images/extras/pickup.jpg'
    }
  ],
  yacht: [
    {
      id: 'catering',
      name: 'Gourmet Catering',
      description: 'Premium dining experience onboard',
      price: 399,
      image: '/images/extras/catering.jpg'
    },
    {
      id: 'watersports',
      name: 'Water Sports Package',
      description: 'Access to jet skis and water activities',
      price: 299,
      image: '/images/extras/watersports.jpg'
    },
    {
      id: 'sunset',
      name: 'Sunset Package',
      description: 'Special setup for sunset viewing',
      price: 199,
      image: '/images/extras/sunset.jpg'
    }
  ],
  'luxury-car': [
    {
      id: 'chauffeur',
      name: 'Professional Chauffeur',
      description: 'Experienced driver for your journey',
      price: 199,
      image: '/images/extras/chauffeur.jpg'
    },
    {
      id: 'refreshments',
      name: 'Premium Refreshments',
      description: 'Selection of drinks and snacks',
      price: 99,
      image: '/images/extras/refreshments.jpg'
    },
    {
      id: 'wifi',
      name: 'Mobile WiFi',
      description: 'High-speed internet during your trip',
      price: 49,
      image: '/images/extras/wifi.jpg'
    }
  ],
  'private-jet': [
    {
      id: 'catering',
      name: 'In-Flight Catering',
      description: 'Luxury dining experience onboard',
      price: 599,
      image: '/images/extras/jet-catering.jpg'
    },
    {
      id: 'concierge',
      name: 'Personal Concierge',
      description: 'Dedicated assistant for your journey',
      price: 399,
      image: '/images/extras/concierge.jpg'
    },
    {
      id: 'transfer',
      name: 'Ground Transfer',
      description: 'Luxury vehicle transfer to/from airport',
      price: 299,
      image: '/images/extras/transfer.jpg'
    }
  ]
};

const ExtrasStep: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const vehicleType = type as VehicleType;

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const availableExtras = vehicleExtras[vehicleType] || [];

  useEffect(() => {
    const extrasTotal = selectedExtras.reduce((total, extraId) => {
      const extra = availableExtras.find(e => e.id === extraId);
      return total + (extra?.price || 0);
    }, 0);
    setTotalPrice(extrasTotal);
  }, [selectedExtras, availableExtras]);

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store extras in session storage
    sessionStorage.setItem('selectedExtras', JSON.stringify({
      items: selectedExtras,
      totalPrice
    }));

    // Navigate to payment step
    router.push(routes.booking.step(vehicleType, 'payment'));
  };

  const handleBack = () => {
    router.push(routes.booking.step(vehicleType, 'datetime'));
  };

  return (
    <BookingLayout currentStep="extras" vehicleType={vehicleType}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">Enhance Your Experience</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Extras Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExtras.map(extra => (
              <motion.div
                key={extra.id}
                className={`
                  relative rounded-xl overflow-hidden border-2 cursor-pointer
                  ${selectedExtras.includes(extra.id)
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-200'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleExtraToggle(extra.id)}
              >
                {/* Image */}
                <div className="aspect-[16/9] relative">
                  <img
                    src={extra.image}
                    alt={extra.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedExtras.includes(extra.id) && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white p-2 rounded-full">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{extra.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{extra.description}</p>
                  <p className="text-amber-600 font-medium">AED {extra.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total Price */}
          {totalPrice > 0 && (
            <div className="text-right">
              <p className="text-lg">
                Total Extras: <span className="font-semibold">AED {totalPrice}</span>
              </p>
            </div>
          )}

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
              Continue to Payment
            </motion.button>
          </div>
        </form>
      </motion.div>
    </BookingLayout>
  );
};

export default ExtrasStep; 