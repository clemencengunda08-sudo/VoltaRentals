import { useEffect } from 'react';

/**
 * Performance-focused scroll observer for entry animations.
 * Minimizes layout recalculations by using IntersectionObserver.
 */
export const useScrollObserver = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Once animated, we don't need to observe this element anymore
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.05, // Trigger earlier for snappier feel
      rootMargin: '0px 0px -20px 0px' 
    });

    const elements = document.querySelectorAll('.fade-up, .scale-in');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);
};