'use client';

import { motion } from "framer-motion";
import { Zap, Car } from "lucide-react";

/**
 * Branded Loading Component for VoltaRentals.
 */
export function VoltaLoader({ fullPage = false }: { fullPage?: boolean }) {
  const content = (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-20 w-20 rounded-[2rem] border-2 border-dashed border-primary/30 flex items-center justify-center"
        >
          <Car size={32} className="text-primary" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={16} className="text-secondary fill-current animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
          Volta<span className="text-primary italic">Rentals</span>
        </p>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
          Synchronizing Registry...
        </p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
