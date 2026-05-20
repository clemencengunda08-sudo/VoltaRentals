'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, ArrowUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Listen for Android/Chrome install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissedAt = localStorage.getItem('volta_pwa_dismissed');
      const lastShown = localStorage.getItem('volta_pwa_last_shown');
      const sessionAttempt = sessionStorage.getItem('volta_pwa_session_attempt');
      
      const isCoolingDown = dismissedAt && (Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000);
      const isRecentlyShown = lastShown && (Date.now() - parseInt(lastShown) < 24 * 60 * 60 * 1000);
      const showCount = parseInt(localStorage.getItem('volta_pwa_show_count') || '0');

      if (!isCoolingDown && !isRecentlyShown && showCount < 2 && !sessionAttempt) {
        // Register intent immediately to stop other pages from setting their own timeouts
        sessionStorage.setItem('volta_pwa_session_attempt', 'true');
        
        const timer = setTimeout(() => {
          setShowBanner(true);
          localStorage.setItem('volta_pwa_show_count', (showCount + 1).toString());
          localStorage.setItem('volta_pwa_last_shown', Date.now().toString());
        }, 15000); // 15 seconds delay for non-intrusive experience
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 4. Fallback for iOS
    if (isIOSDevice) {
      const dismissedAt = localStorage.getItem('volta_pwa_dismissed');
      const lastShown = localStorage.getItem('volta_pwa_last_shown');
      const sessionAttempt = sessionStorage.getItem('volta_pwa_session_attempt');
      const isCoolingDown = dismissedAt && (Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000);
      const isRecentlyShown = lastShown && (Date.now() - parseInt(lastShown) < 24 * 60 * 60 * 1000);
      const showCount = parseInt(localStorage.getItem('volta_pwa_show_count') || '0');

      if (!isCoolingDown && !isRecentlyShown && showCount < 2 && !sessionAttempt) {
        sessionStorage.setItem('volta_pwa_session_attempt', 'true');
        const timer = setTimeout(() => {
          setShowBanner(true);
          localStorage.setItem('volta_pwa_show_count', (showCount + 1).toString());
          localStorage.setItem('volta_pwa_last_shown', Date.now().toString());
        }, 18000);
        return () => clearTimeout(timer);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
      toast({ title: "🎉 Volta installed!", description: "Check your home screen." });
      localStorage.setItem('volta_installed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('volta_pwa_dismissed', Date.now().toString());
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-sm z-[9985]"
        >
          <div className="bg-card border border-border rounded-2xl shadow-3xl overflow-hidden relative">
            {/* Top Accent Protocol */}
            <div className="h-[3px] w-full bg-gradient-to-r from-primary via-secondary to-accent" />
            
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0">
                    <Zap className="h-6 w-6 text-white fill-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Install VoltaRentals</h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                      Get the elite app experience. Book assets faster from your home screen.
                    </p>
                  </div>
                </div>
                <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              {isIOS ? (
                <div className="bg-primary/5 border border-dashed border-primary/20 rounded-xl p-3 space-y-3">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <ArrowUp size={12} className="animate-bounce" /> iOS Setup Instructions
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Tap the <span className="font-bold text-foreground inline-flex items-center gap-1">share button <Download size={10} /></span> then scroll down and select <span className="font-bold text-foreground">"Add to Home Screen"</span>.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 pt-2">
                  <Button 
                    onClick={handleInstall}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-lg shadow-xl"
                  >
                    Install Application
                  </Button>
                  <button 
                    onClick={handleDismiss}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    Not Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}