import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BackgroundMediaProps {
  videoSrc: string;
  imageSrc: string;
  scrollY: number;
  alt: string;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  videoSrc,
  imageSrc,
  scrollY,
  alt
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
      role="img"
      aria-label={alt}
    >
      {/* Fallback Image */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.5}px) scale(${1 + Math.abs(scrollY) * 0.0005})`,
          opacity: videoLoaded && !videoError ? 0 : 1
        }}
        role="img"
        aria-label={alt}
      />

      {/* Video Background */}
      {!videoError && (
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translateY(${scrollY * 0.5}px) scale(${1 + Math.abs(scrollY) * 0.0005})`,
            opacity: videoLoaded ? 1 : 0
          }}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          aria-label={alt}
          title={alt}
        >
          <source src={videoSrc} type="video/mp4" />
          <track kind="captions" src="" label="English captions" />
        </motion.video>
      )}

      {/* Loading Overlay */}
      {!videoLoaded && !videoError && (
        <div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          role="alert"
          aria-label="Loading media"
        >
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
}; 