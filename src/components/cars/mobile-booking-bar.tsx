'use client';

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface MobileBookingBarProps {
  car: any;
  availability: any;
}

export function MobileBookingBar({ car, availability }: MobileBookingBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBooking = () => {
    const card = document.querySelector('.sticky');
    card?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 inset-x-0 z-[60] lg:hidden p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-black text-primary leading-none">TSh {car.pricePerDay?.toLocaleString()}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1">Reserve / Day</p>
            </div>
            <Button 
              onClick={scrollToBooking}
              className="rounded-full h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-lg gap-2"
            >
              <Zap size={12} className="text-secondary fill-current" />
              Book Now
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}