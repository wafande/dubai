import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { routes } from '../../config/routes';
import { getGalleryAssets } from '../../config/media';
import type { TourPackage, VehicleType } from '../../types';

interface TourDetailProps {
  tour: TourPackage;
}

export const TourDetail: React.FC<TourDetailProps> = ({ tour }) => {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const galleryAssets = getGalleryAssets(tour.type);

  const handleBookNow = () => {
    router.push(routes.booking.step(tour.type as VehicleType, 'details'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.img
          src={galleryAssets[selectedImageIndex].image}
          alt={galleryAssets[selectedImageIndex].alt}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Tour Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {tour.name}
            </motion.h1>
            <motion.div
              className="flex items-center gap-4 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="flex items-center">
                <span className="text-amber-500 mr-1">★</span>
                {tour.rating}
              </span>
              <span>•</span>
              <span>{tour.duration} Hours</span>
              <span>•</span>
              <span>Up to {tour.maxCapacity} People</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            {/* Description */}
            <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Tour</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {tour.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tour.includes.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            <section className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryAssets.map((asset, index) => (
                  <motion.button
                    key={index}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsGalleryOpen(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={asset.thumbnail}
                      alt={asset.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    AED {tour.price.toLocaleString()}
                  </div>
                  <div className="text-gray-500">per {tour.duration} hours</div>
                </div>

                <motion.button
                  className="
                    w-full bg-amber-500 text-white py-4 px-6 rounded-lg
                    font-semibold text-lg mb-4 hover:bg-amber-600
                    focus:outline-none focus:ring-4 focus:ring-amber-500/50
                  "
                  onClick={handleBookNow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book Now
                </motion.button>

                <div className="text-center text-gray-500 text-sm">
                  Free cancellation up to 24 hours before the tour
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-white p-2"
              onClick={() => setIsGalleryOpen(false)}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="w-full max-w-6xl px-4">
              <motion.img
                src={galleryAssets[selectedImageIndex].image}
                alt={galleryAssets[selectedImageIndex].alt}
                className="w-full h-auto max-h-[80vh] object-contain"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              />

              <div className="flex justify-center mt-4 gap-2">
                {galleryAssets.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === selectedImageIndex
                        ? 'bg-white'
                        : 'bg-white/30'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 