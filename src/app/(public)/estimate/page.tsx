
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TripEstimator } from "@/components/ui/TripEstimator";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Zap } from "lucide-react";

/**
 * Standalone Estimate Terminal.
 * Provides wateja with complete transparency over trip costs.
 */
export default function EstimatePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center space-y-6 mb-20">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em]"
             >
                <Zap size={14} className="fill-current animate-pulse" /> Financial Node Active
             </motion.div>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none"
             >
                Expedition <span className="text-primary italic">Estimator</span>
             </motion.h1>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-muted-foreground text-lg font-medium italic max-w-2xl mx-auto"
             >
               "Precision cost calculations for elite travel across the United Republic."
             </motion.p>
          </div>

          <TripEstimator />

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { icon: <TrendingUp className="text-emerald-500" />, title: "Live Market Rates", text: "Estimates are synchronized with current Tanzanian fuel price protocols." },
               { icon: <ShieldCheck className="text-primary" />, title: "Policy Integrity", text: "Calculations include our standard 300km/day free mileage allowance." },
               { icon: <Zap className="text-secondary" />, title: "Direct Sync", text: "These estimates can be converted into confirmed reservations instantly." },
             ].map((feature, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="executive-card p-10 space-y-4 text-center"
               >
                  <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto shadow-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">"{feature.text}"</p>
               </motion.div>
             ))}
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
