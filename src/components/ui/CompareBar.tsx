'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "@/context/CompareContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, GitCompare, ChevronRight, Car as CarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Floating Comparison Bar Component.
 * Surfaces at bottom of viewport when vehicles are selected for comparison.
 */
export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();
  const isVisible = compareList.length >= 2;

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border shadow-[0_-20px_60px_rgba(0,0,0,0.3)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* LABEL REGISTRY */}
              <div className="shrink-0 hidden lg:block">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Comparison Buffer</p>
                <p className="text-[8px] text-muted-foreground font-black uppercase mt-1">{compareList.length} of 3 units selected</p>
              </div>

              {/* SLOTS NODE */}
              <div className="flex-1 flex items-center gap-3 w-full">
                {[0, 1, 2].map((slot) => {
                  const car = compareList[slot];
                  return (
                    <motion.div
                      key={slot}
                      layout
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300 min-w-[120px] flex-1 max-w-[240px]",
                        car 
                          ? "bg-muted/50 border-primary/20 shadow-inner" 
                          : "border-dashed border-border/50 bg-transparent"
                      )}
                    >
                      {car ? (
                        <>
                          <div className="h-10 w-16 rounded-lg overflow-hidden bg-background shrink-0 relative border border-white/5">
                            {car.images?.[0] ? (
                              <Image src={car.images[0]} alt={car.make} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center"><CarIcon size={14} className="text-muted-foreground/30" /></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black uppercase text-foreground truncate">{car.make} {car.model}</p>
                            <p className="text-[8px] text-primary font-black mt-0.5">TSh {car.pricePerDay?.toLocaleString()}</p>
                          </div>

                          <button
                            onClick={() => removeFromCompare(car.id)}
                            className="h-6 w-6 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors shrink-0 shadow-sm"
                          >
                            <X size={10} />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 w-full justify-center py-1 opacity-20">
                          <div className="h-6 w-6 rounded-lg border border-dashed border-border flex items-center justify-center">
                            <span className="text-[10px]">+</span>
                          </div>
                          <span className="text-[8px] font-black uppercase">Add Unit</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* ACTION TERMINAL */}
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                <button
                  onClick={clearCompare}
                  className="text-[8px] font-black uppercase text-muted-foreground hover:text-foreground tracking-[0.2em] transition-colors px-2"
                >
                  Clear Buffer
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={!isVisible}
                  onClick={() => router.push("/compare")}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl",
                    isVisible
                      ? "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed grayscale"
                  )}
                >
                  <GitCompare size={14} />
                  Compare Node
                  <ChevronRight size={12} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
