'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Database, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Admin Intelligence Node.
 * An interactive briefing component used for pitching the technical "Why" 
 * behind VoltaRentals architecture.
 */
export function AdminIntelligenceNode() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-2xl h-14 px-8 border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl shadow-primary/10 hover:bg-primary hover:text-white transition-all group"
        >
          <Zap size={16} className="fill-current animate-pulse group-hover:text-white" />
          Technical Pitch Briefing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-card border-border rounded-[3rem] p-0 overflow-hidden text-foreground">
        <DialogTitle className="sr-only">Technical Pitch Briefing</DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Sidebar Info */}
          <div className="lg:col-span-4 bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
               <Globe size={300} />
            </div>
            <div className="space-y-6 relative z-10">
              <Badge className="bg-white/20 text-white border-none uppercase text-[8px] font-black tracking-widest">Operational Protocol 2026</Badge>
              <h2 className="text-4xl font-black uppercase leading-none tracking-tighter">Atomic Tech Node</h2>
              <p className="text-blue-100/60 text-sm font-medium leading-relaxed italic">
                "Volta is not a website. It is an automated logistical protocol for the Tanzanian executive market."
              </p>
            </div>
            <div className="pt-12 relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Master Architecture</p>
               <p className="text-[8px] font-bold text-white/40 uppercase mt-1 tracking-widest">Registry ID: TZ-VLT-PRO</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary"><Database size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">The Data Hub (Firebase)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Selected over SQL for <strong>Real-time Synchronization</strong>. Firestore listeners ensure fleet availability updates across all branch hubs in under 100ms.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-secondary"><Sparkles size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">Intelligence (Gemini AI)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every booking is analyzed by <strong>Gemini 2.5 Flash</strong> to determine customer risk profiles and automate upsell suggestions like armored vehicle upgrades.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-emerald-500"><Cpu size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">Automation Engine</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Integrated with <strong>n8n workflows</strong> for automated WhatsApp dispatches and real-time accounting sync to Google Sheets.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-blue-500"><ShieldCheck size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">Revenue Protection</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pesapal API 3.0 integration provides bank-level security and automated reconciliation, preventing payment screenshot fraud.
                </p>
              </div>

            </div>

            <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-black uppercase overflow-hidden">
                          <img src={`https://picsum.photos/seed/${i+10}/100/100`} className="object-cover" />
                       </div>
                     ))}
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Built for Tanzania's Elite</p>
               </div>
               <Button onClick={() => window.open('https://github.com', '_blank')} variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest gap-2">
                  View Source Registry <ArrowRight size={14} />
               </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
