'use client';

import { useCompare } from "@/context/CompareContext";
import { Button } from "@/components/ui/button";
import { X, GitCompare, Zap, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { VoltaImage } from "@/components/ui/VoltaImage";

export function CompareDrawer() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  
  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] w-[95%] max-w-2xl"
      >
        <div className="bg-card/80 backdrop-blur-2xl border-2 border-primary/20 rounded-[2.5rem] shadow-3xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
              <GitCompare size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight">Registry Comparison</h4>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{compareList.length} Units Selected</p>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {compareList.map((car) => (
              <div key={car.id} className="relative group shrink-0">
                <div className="h-14 w-20 rounded-xl overflow-hidden bg-muted border border-border">
                  <VoltaImage src={car.images?.[0]} alt={car.model} fill className="object-cover" />
                </div>
                <button 
                  onClick={() => removeFromCompare(car.id)}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 shadow-sm"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {compareList.length < 3 && (
              <div className="h-14 w-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/30 italic text-[8px] font-black uppercase text-center px-2">
                Add More
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearCompare}
              className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
            <Link href="/compare">
              <Button className="h-12 px-6 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl gap-2 transition-all active:scale-95">
                Compare Now <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
