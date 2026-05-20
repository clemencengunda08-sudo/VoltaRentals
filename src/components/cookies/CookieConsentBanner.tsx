'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  hasConsented, 
  acceptAllCookies, 
  rejectOptionalCookies, 
  setCookieConsent 
} from '@/lib/cookies';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [prefs, setPrefs] = useState({
    analytics: false,
    marketing: false,
    functional: true
  });

  useEffect(() => {
    if (!hasConsented()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
    toast({ title: "🍪 Preferences saved!", description: "Thank you for trusting VoltaRentals." });
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setIsVisible(false);
    toast({ title: "🍪 Optional cookies disabled", description: "Your preference has been logged." });
  };

  const handleSavePreferences = () => {
    setCookieConsent(prefs);
    setIsVisible(false);
    toast({ title: "🍪 Cookie preferences updated", description: "Your settings are now active." });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-[9990] p-4 md:p-6 flex justify-start"
      >
        <div className="w-full max-w-[520px] bg-card border border-border rounded-[2rem] shadow-3xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍪</span>
                <h2 className="text-lg font-black uppercase tracking-tighter text-foreground">We Value Your Privacy</h2>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
              We use cookies to improve your experience on VoltaRentals. 
              Essential cookies keep the site running. Optional cookies 
              help us understand how you use our platform and improve 
              our services for Tanzania.
            </p>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6 pt-4 border-t border-border overflow-hidden"
                >
                  <div className="grid gap-6">
                    {/* Essential */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[13px] font-black uppercase text-foreground">Essential Cookies</p>
                        <p className="text-[11px] text-muted-foreground leading-normal">Required for basic site functionality. Login, security, and bookings.</p>
                      </div>
                      <Switch checked disabled className="data-[state=checked]:bg-primary/20" />
                    </div>

                    {/* Functional */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[13px] font-black uppercase text-foreground">Functional Cookies</p>
                        <p className="text-[11px] text-muted-foreground leading-normal">Enable enhanced features like saved searches and personalized recommendations.</p>
                      </div>
                      <Switch 
                        checked={prefs.functional} 
                        onCheckedChange={(v) => setPrefs({...prefs, functional: v})} 
                      />
                    </div>

                    {/* Analytics */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[13px] font-black uppercase text-foreground">Analytics Cookies</p>
                        <p className="text-[11px] text-muted-foreground leading-normal">Help us understand how visitors use VoltaRentals. Anonymous usage data only.</p>
                      </div>
                      <Switch 
                        checked={prefs.analytics} 
                        onCheckedChange={(v) => setPrefs({...prefs, analytics: v})} 
                      />
                    </div>

                    {/* Marketing */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[13px] font-black uppercase text-foreground">Marketing Cookies</p>
                        <p className="text-[11px] text-muted-foreground leading-normal">Allow us to show you relevant offers and remember your preferences.</p>
                      </div>
                      <Switch 
                        checked={prefs.marketing} 
                        onCheckedChange={(v) => setPrefs({...prefs, marketing: v})} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest h-11 px-8 rounded-xl shadow-xl shadow-primary/20"
                >
                  Accept All
                </Button>
                
                {isExpanded ? (
                  <Button 
                    variant="outline"
                    onClick={handleSavePreferences}
                    className="border-border text-foreground font-black uppercase text-[10px] tracking-widest h-11 px-8 rounded-xl"
                  >
                    Save Preferences
                  </Button>
                ) : (
                  <Button 
                    variant="ghost"
                    onClick={() => setIsExpanded(true)}
                    className="text-primary font-black uppercase text-[10px] tracking-widest h-11 px-4 rounded-xl flex items-center gap-2"
                  >
                    Manage Preferences <ChevronDown size={14} />
                  </Button>
                )}
                
                <button 
                  onClick={handleRejectOptional}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Reject Optional
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground leading-tight">
                By continuing to use VoltaRentals, you agree to our{" "}
                <Link href="/privacy" className="text-primary underline font-bold">Cookie Policy</Link> and{" "}
                <Link href="/privacy" className="text-primary underline font-bold">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
