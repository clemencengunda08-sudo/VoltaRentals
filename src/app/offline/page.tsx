'use client';

import { WifiOff, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#1E3A5F] flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full space-y-12">
        {/* Brand Node */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl">
            <Zap className="h-10 w-10 fill-white text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              VOLTA<span className="text-primary italic">RENTALS</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
              Elite Fleet Terminal
            </p>
          </div>
        </div>

        {/* Status Node */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <WifiOff size={48} className="text-white/40" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter">You're Offline</h1>
            <p className="text-white/60 font-medium">
              It looks like you have lost internet connection.
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-6 text-left space-y-4 border border-white/5">
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">Connection Required for:</p>
            <ul className="space-y-2 text-sm text-white/50 font-medium">
              <li className="flex items-center gap-2">• Browse available vehicles</li>
              <li className="flex items-center gap-2">• Make and manage bookings</li>
              <li className="flex items-center gap-2">• Process payments</li>
              <li className="flex items-center gap-2">• View your dashboard</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <Button 
            onClick={handleRetry}
            className="w-full h-16 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A5F] font-black uppercase text-xs tracking-widest rounded-xl shadow-2xl gap-3 transition-all active:scale-95"
          >
            <RefreshCw size={18} /> Try Again
          </Button>
          <p className="text-[10px] text-white/30 font-medium italic">
            "If the problem continues, check your WiFi or mobile data."
          </p>
        </div>

        <div className="pt-8 border-t border-white/5 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-widest">
            Premium Car Rentals - Tanzania 🇹🇿
          </p>
        </div>
      </div>
    </main>
  );
}