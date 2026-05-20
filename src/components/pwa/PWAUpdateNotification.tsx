'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for waiting worker
        if (reg.waiting) {
          setShowUpdate(true);
        }

        // Listen for new waiting workers
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });

      // Reload when new worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-20 inset-x-0 z-[9990] flex justify-center p-4 pointer-events-none"
        >
          <div className="bg-[#1E3A5F] text-white px-6 py-4 rounded-2xl shadow-3xl border border-white/10 flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-secondary animate-spin-slow" />
              <p className="text-xs font-black uppercase tracking-widest leading-none">
                Protocol Update Available
              </p>
            </div>
            <Button 
              onClick={handleUpdate}
              size="sm"
              className="bg-secondary text-primary font-black uppercase text-[10px] tracking-widest h-8 px-4 rounded-lg shadow-xl"
            >
              Sync Now
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}