import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaLoaderProps {
  src: string;
  alt: string;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const MediaLoader = ({
  src,
  alt,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  onLoad,
  onError,
}: MediaLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
      onError?.(new Error('Failed to load image'));
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 flex items-center justify-center bg-gray-900 ${loadingClassName}`}
          >
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 flex items-center justify-center bg-red-900/20 ${errorClassName}`}
          >
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-red-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </motion.div>
        )}

        {imageSrc && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={imageSrc}
            alt={alt}
            className={`w-full h-full object-cover ${error ? 'opacity-50' : ''}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaLoader; 