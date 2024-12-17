import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IMAGE_PARAMS } from '../constants/media';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  quality?: keyof typeof IMAGE_PARAMS.QUALITY;
  effects?: Array<keyof typeof IMAGE_PARAMS.EFFECTS | { [K in keyof typeof IMAGE_PARAMS.EFFECTS]: string | number }>;
  aspectRatio?: keyof typeof IMAGE_PARAMS.ASPECT_RATIOS;
  focalPoint?: keyof typeof IMAGE_PARAMS.FOCAL_POINTS;
  transforms?: Array<{
    type: keyof typeof IMAGE_PARAMS.TRANSFORMS;
    value?: number;
  }>;
  optimizations?: Array<keyof typeof IMAGE_PARAMS.OPTIMIZATIONS>;
  responsive?: boolean;
  lazy?: boolean;
  blur?: boolean;
  priority?: boolean;
  intersectionThreshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  quality = 'MEDIUM',
  effects = [],
  aspectRatio,
  focalPoint = 'CENTER',
  transforms = [],
  optimizations = ['PROGRESSIVE'],
  responsive = true,
  lazy = true,
  blur = true,
  priority = false,
  intersectionThreshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(priority);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Build image URL with all parameters
  const buildImageUrl = useCallback((baseUrl: string, width?: number) => {
    const params: string[] = [];

    // Quality parameters
    const qualityParams = width
      ? `?auto=compress&q=${IMAGE_PARAMS.QUALITY[quality].quality}&w=${width}&fm=webp`
      : IMAGE_PARAMS.QUALITY[quality].params;
    params.push(qualityParams);

    // Effects
    effects.forEach(effect => {
      if (typeof effect === 'string') {
        params.push(IMAGE_PARAMS.EFFECTS[effect]);
      } else {
        const [effectName, value] = Object.entries(effect)[0];
        if (typeof IMAGE_PARAMS.EFFECTS[effectName] === 'object') {
          params.push(IMAGE_PARAMS.EFFECTS[effectName][value as string]);
        }
      }
    });

    // Aspect ratio
    if (aspectRatio) {
      params.push(IMAGE_PARAMS.ASPECT_RATIOS[aspectRatio]);
    }

    // Focal point
    params.push(IMAGE_PARAMS.FOCAL_POINTS[focalPoint]);

    // Transforms
    transforms.forEach(transform => {
      if (typeof IMAGE_PARAMS.TRANSFORMS[transform.type] === 'function') {
        params.push(IMAGE_PARAMS.TRANSFORMS[transform.type](transform.value || 0));
      } else {
        params.push(IMAGE_PARAMS.TRANSFORMS[transform.type]);
      }
    });

    // Optimizations
    optimizations.forEach(opt => {
      params.push(IMAGE_PARAMS.OPTIMIZATIONS[opt]);
    });

    return `${baseUrl}${params.join('')}`;
  }, [quality, effects, aspectRatio, focalPoint, transforms, optimizations]);

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback(() => {
    if (!responsive) return undefined;

    return Object.entries(IMAGE_PARAMS.RESPONSIVE.sizes)
      .map(([size, width]) => `${buildImageUrl(src, width)} ${width}w`)
      .join(', ');
  }, [responsive, buildImageUrl, src]);

  // Generate sizes attribute for responsive images
  const generateSizes = useCallback(() => {
    if (!responsive) return undefined;

    return Object.entries(IMAGE_PARAMS.RESPONSIVE.breakpoints)
      .map(([size, query]) => `${query} ${IMAGE_PARAMS.RESPONSIVE.sizes[size as keyof typeof IMAGE_PARAMS.RESPONSIVE.sizes]}px`)
      .join(', ');
  }, [responsive]);

  // Intersection Observer setup
  useEffect(() => {
    if (priority || !lazy) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: intersectionThreshold,
        rootMargin,
      }
    );

    if (imageRef.current) {
      observerRef.current.observe(imageRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, lazy, intersectionThreshold, rootMargin]);

  // Image loading logic
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    // If blur effect is enabled, load a tiny version first
    if (blur) {
      const tinyImg = new Image();
      tinyImg.src = buildImageUrl(src, 20) + IMAGE_PARAMS.EFFECTS.BLUR;
      tinyImg.onload = () => {
        setImageSrc(tinyImg.src);
      };
    }

    // Load the full image
    img.src = buildImageUrl(src);
    
    img.onload = () => {
      setImageSrc(img.src);
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
  }, [isInView, src, buildImageUrl, blur, onLoad, onError]);

  return (
    <div ref={imageRef} className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {isLoading && blur && imageSrc && (
          <motion.img
            src={imageSrc}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {imageSrc && (
          <motion.img
            src={buildImageUrl(src)}
            srcSet={generateSrcSet()}
            sizes={generateSizes()}
            alt={alt}
            loading={lazy && !priority ? 'lazy' : undefined}
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedImage; 