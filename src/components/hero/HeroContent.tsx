import React from 'react';
import { motion } from 'framer-motion';
import type { VehicleType } from '../../types';

interface HeroContentProps {
  title: string;
  subtitle: string;
  selectedType: VehicleType;
  onTypeChange?: (type: VehicleType) => void;
  isLoaded: boolean;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  title,
  subtitle,
  selectedType,
  onTypeChange,
  isLoaded
}) => {
  const vehicleTypes: Array<{ type: VehicleType; label: string }> = [
    { type: 'helicopter', label: 'Helicopters' },
    { type: 'yacht', label: 'Yachts' },
    { type: 'luxury-car', label: 'Luxury Cars' },
    { type: 'private-jet', label: 'Private Jets' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center text-white px-4"
      variants={containerVariants}
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
    >
      {/* Main Title */}
      <motion.h1
        className="text-5xl md:text-7xl font-bold mb-4"
        variants={itemVariants}
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-xl md:text-2xl mb-8 text-gray-200"
        variants={itemVariants}
      >
        {subtitle}
      </motion.p>

      {/* Vehicle Type Selector */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mt-8"
        variants={itemVariants}
      >
        {vehicleTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onTypeChange?.(type)}
            className={`
              px-6 py-2 rounded-full text-sm font-semibold transition-all
              ${selectedType === type
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-black/30 text-white hover:bg-white/20'
              }
            `}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full p-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce mx-auto" />
        </div>
      </motion.div>
    </motion.div>
  );
}; 