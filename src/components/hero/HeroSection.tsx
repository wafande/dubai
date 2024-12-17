import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherDisplay } from '../shared/WeatherDisplay';
import { BookingCTA } from './BookingCTA';
import { BackgroundMedia } from './BackgroundMedia';
import { HeroContent } from './HeroContent';
import { useParallax } from '../../utils/hooks/useParallax';
import { getMediaAsset } from '../../config/media';
import type { VehicleType } from '../../types';

interface HeroSectionProps {
  selectedVehicleType?: VehicleType;
  onVehicleTypeChange?: (type: VehicleType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedVehicleType = 'helicopter',
  onVehicleTypeChange
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useParallax();

  // Content for different vehicle types
  const content = {
    helicopter: {
      title: 'Experience Dubai From Above',
      subtitle: 'Luxury Helicopter Tours'
    },
    yacht: {
      title: 'Sail in Ultimate Luxury',
      subtitle: 'Premium Yacht Charters'
    },
    'luxury-car': {
      title: 'Drive in Style',
      subtitle: 'Exclusive Car Collection'
    },
    'private-jet': {
      title: 'Fly Private',
      subtitle: 'Luxury Jet Services'
    }
  };

  useEffect(() => {
    // Preload the next vehicle type's media
    const preloadNextMedia = () => {
      const types: VehicleType[] = ['helicopter', 'yacht', 'luxury-car', 'private-jet'];
      const currentIndex = types.indexOf(selectedVehicleType);
      const nextIndex = (currentIndex + 1) % types.length;
      const nextType = types[nextIndex];
      
      const { image, video } = getMediaAsset(nextType);
      
      // Preload image
      const img = new Image();
      img.src = image;
      
      // Preload video
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.src = video;
    };

    setIsLoaded(true);
    preloadNextMedia();
  }, [selectedVehicleType]);

  const currentContent = content[selectedVehicleType];
  const mediaAsset = getMediaAsset(selectedVehicleType);

  return (
    <motion.section 
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <BackgroundMedia
          key={selectedVehicleType}
          videoSrc={mediaAsset.video}
          imageSrc={mediaAsset.image}
          scrollY={scrollY}
          alt={mediaAsset.alt}
        />
      </AnimatePresence>

      {/* Overlay Gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 z-10"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 h-full container mx-auto px-4">
        <WeatherDisplay className="absolute top-8 right-4" />
        
        <HeroContent
          title={currentContent.title}
          subtitle={currentContent.subtitle}
          selectedType={selectedVehicleType}
          onTypeChange={onVehicleTypeChange}
          isLoaded={isLoaded}
        />

        <BookingCTA
          vehicleType={selectedVehicleType}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        />
      </div>
    </motion.section>
  );
}; 