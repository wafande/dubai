import { useState, useEffect } from 'react';

interface ParallaxState {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  scrollSpeed: number;
}

export const useParallax = () => {
  const [state, setState] = useState<ParallaxState>({
    scrollY: 0,
    scrollDirection: 'down',
    scrollSpeed: 0
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const currentTime = Date.now();
          const timeDiff = currentTime - lastScrollTime;
          const scrollDiff = Math.abs(currentScrollY - lastScrollY);
          
          setState({
            scrollY: currentScrollY,
            scrollDirection: currentScrollY > lastScrollY ? 'down' : 'up',
            scrollSpeed: timeDiff > 0 ? scrollDiff / timeDiff : 0
          });

          lastScrollY = currentScrollY;
          lastScrollTime = currentTime;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return state;
}; 