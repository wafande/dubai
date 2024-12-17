import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { routes } from '../../config/routes';
import { getMediaAsset } from '../../config/media';
import type { TourPackage } from '../../types';

interface TourCardProps {
  tour: TourPackage;
  priority?: boolean;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, priority = false }) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const mediaAsset = getMediaAsset(tour.type);

  const handleClick = () => {
    router.push(routes.booking.vehicle(tour.type));
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Card Container with 3D Effect */}
      <motion.div
        className="
          relative overflow-hidden rounded-xl bg-white shadow-xl
          transform-gpu transition-all duration-300
          hover:shadow-2xl
        "
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        whileHover={{
          rotateX: 2,
          rotateY: 5,
          scale: 1.02
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={mediaAsset.image}
            alt={mediaAsset.alt}
            className="w-full h-full object-cover"
            loading={priority ? 'eager' : 'lazy'}
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Overlay Gradient */}
          <div className="
            absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
            opacity-60 group-hover:opacity-80 transition-opacity duration-300
          " />

          {/* Featured Badge */}
          {tour.featured && (
            <div className="
              absolute top-4 left-4 bg-amber-500 text-white
              px-3 py-1 rounded-full text-sm font-semibold
              shadow-lg
            ">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{tour.name}</h3>
            <div className="flex items-center">
              <span className="text-amber-500">★</span>
              <span className="ml-1 text-sm text-gray-600">
                {tour.rating} ({tour.reviewCount})
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {tour.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tour.includes.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="
                  px-2 py-1 bg-gray-100 text-gray-600 rounded-md
                  text-xs font-medium
                "
              >
                {feature}
              </span>
            ))}
            {tour.includes.length > 3 && (
              <span className="text-xs text-gray-500">
                +{tour.includes.length - 3} more
              </span>
            )}
          </div>

          {/* Price and Duration */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                AED {tour.price.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                / {tour.duration}h
              </span>
            </div>
            <motion.button
              className="
                bg-amber-500 text-white px-4 py-2 rounded-lg
                font-semibold text-sm hover:bg-amber-600
                focus:outline-none focus:ring-2 focus:ring-amber-500/50
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Now
            </motion.button>
          </div>
        </div>

        {/* Quick View Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/80 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
        >
          <div className="text-center text-white p-6">
            <h4 className="text-2xl font-bold mb-4">Quick View</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-gray-400 text-sm">Max Capacity</div>
                <div className="font-semibold">{tour.maxCapacity} People</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Duration</div>
                <div className="font-semibold">{tour.duration} Hours</div>
              </div>
            </div>
            <motion.button
              className="
                bg-white text-black px-6 py-3 rounded-lg
                font-semibold hover:bg-gray-100
                focus:outline-none focus:ring-2 focus:ring-white/50
              "
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(routes.booking.step(tour.type, 'details'));
              }}
            >
              View Details
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 