import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { routes } from '../../config/routes';
import type { VehicleType } from '../../types';

interface BookingCTAProps {
  vehicleType: VehicleType;
  className?: string;
}

export const BookingCTA: React.FC<BookingCTAProps> = ({
  vehicleType,
  className = ''
}) => {
  const router = useRouter();

  const ctaText = {
    helicopter: 'Book Your Helicopter Tour',
    yacht: 'Charter a Luxury Yacht',
    'luxury-car': 'Reserve Your Dream Car',
    'private-jet': 'Book Private Jet'
  };

  const handleClick = () => {
    router.push(routes.booking.vehicle(vehicleType));
  };

  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Main CTA Button */}
      <motion.button
        onClick={handleClick}
        className="
          bg-amber-500 hover:bg-amber-600 text-white
          px-8 py-4 rounded-full text-lg font-semibold
          transform transition-all duration-300
          hover:scale-105 hover:shadow-2xl
          focus:outline-none focus:ring-4 focus:ring-amber-500/50
        "
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {ctaText[vehicleType]}
      </motion.button>

      {/* Availability Indicator */}
      <motion.div
        className="mt-4 flex items-center gap-2 text-white/90 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Available Today</span>
      </motion.div>
    </motion.div>
  );
}; 