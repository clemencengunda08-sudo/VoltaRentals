'use client';

import { Zap } from "lucide-react";

export function DemoBanner() {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!isDemo) return null;

  return (
    <div className="bg-secondary text-secondary-foreground py-1.5 px-4 text-center relative z-[110] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Zap size={12} className="fill-current animate-pulse" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">
          DEMO MODE — All payments are in sandbox. No real money is charged.
        </p>
        <Zap size={12} className="fill-current animate-pulse" />
      </div>
    </div>
  );
}
