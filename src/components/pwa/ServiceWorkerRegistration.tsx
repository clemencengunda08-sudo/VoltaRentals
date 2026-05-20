'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Node.
 * Registers the SW and handles periodic update checks.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW Registered with scope:', registration.scope);

          // Check for updates every 30 minutes
          setInterval(() => {
            registration.update();
          }, 30 * 60 * 1000);

        } catch (error) {
          console.error('SW Registration failed:', error);
        }
      };

      registerSW();
    }
  }, []);

  return null;
}