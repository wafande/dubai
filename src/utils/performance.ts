import { useEffect, useCallback } from 'react';
import { IMAGE_PARAMS } from '../constants/imageParams';

// Preload images with priority
export const useImagePreloader = (imageUrls: string[], quality: keyof typeof IMAGE_PARAMS.QUALITY = 'MEDIUM') => {
  const preloadImage = useCallback((url: string) => {
    const img = new Image();
    const params = IMAGE_PARAMS.QUALITY[quality].params;
    img.src = `${url}${params}`;
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }, [quality]);

  useEffect(() => {
    const preloadAll = async () => {
      try {
        await Promise.all(imageUrls.map(preloadImage));
      } catch (error) {
        console.warn('Failed to preload some images:', error);
      }
    };

    preloadAll();
  }, [imageUrls, preloadImage]);
};

// Lazy load images with Intersection Observer
export const useLazyLoad = (
  elementRef: React.RefObject<HTMLElement>,
  callback: () => void,
  options = { threshold: 0.1, rootMargin: '50px' }
) => {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [elementRef, callback, options.threshold, options.rootMargin]);
};

// Dynamic import with loading state
export const useDynamicImport = <T,>(
  importFn: () => Promise<{ default: T }>,
  onError?: (error: Error) => void
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        const module = await importFn();
        setComponent(module.default);
      } catch (err) {
        setError(err as Error);
        onError?.(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [importFn, onError]);

  return { Component, isLoading, error };
};

// Resource hints for performance optimization
export const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'dns-prefetch', href: 'https://api.dubai-luxury.com' },
  ];

  hints.forEach(({ rel, href, crossOrigin }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
  });
};

// Cache API utilities
export const cacheResources = async (urls: string[], cacheName = 'dubai-luxury-cache') => {
  if ('caches' in window) {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(urls);
    } catch (error) {
      console.warn('Failed to cache resources:', error);
    }
  }
};

// Performance monitoring
export const measurePerformance = (metricName: string) => {
  if ('performance' in window) {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`${metricName} took ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }
  return { end: () => 0 };
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 