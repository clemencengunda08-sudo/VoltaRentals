'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  getCookieConsent, 
  setCookieConsent, 
  revokeConsent, 
  CookiePreferences 
} from "@/lib/cookies";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ShieldCheck, Info, MessageCircle, Phone, RefreshCw } from "lucide-react";
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function CookieSettingsPage() {
  const [prefs, setPrefs] = useState<CookiePreferences | null>(null);
  const [localPrefs, setLocalPrefs] = useState({
    analytics: false,
    marketing: false,
    functional: true
  });

  useEffect(() => {
    const current = getCookieConsent();
    if (current) {
      setPrefs(current);
      setLocalPrefs({
        analytics: current.analytics,
        marketing: current.marketing,
        functional: current.functional
      });
    }
  }, []);

  const handleSave = () => {
    setCookieConsent(localPrefs);
    const updated = getCookieConsent();
    setPrefs(updated);
    toast({ title: "Preferences Saved ✨", description: "Your privacy registry has been updated." });
  };

  const handleReset = () => {
    revokeConsent();
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-32 bg-background">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-4">
             <AnimatedSection direction="down">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-xl border border-primary/20">
                   <span className="text-3xl">🍪</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">Cookie <span className="text-primary italic">Settings</span></h1>
                <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] mt-4">Privacy Registry Node 1.0</p>
             </AnimatedSection>
          </div>

          {/* SECTION 1: CURRENT STATUS */}
          <AnimatedSection direction="up" delay={0.2}>
            <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <ShieldCheck size={120} />
              </div>
              <CardContent className="p-10 space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                       <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Current Status</h2>
                       {prefs ? (
                         <p className="text-xs text-muted-foreground font-medium">Consent granted on <span className="text-foreground font-bold">{format(prefs.timestamp, "PPP")}</span></p>
                       ) : (
                         <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">You have not set your preferences yet.</p>
                       )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black px-3 h-6 rounded-full">✅ Essential</Badge>
                       {prefs?.functional && <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black px-3 h-6 rounded-full">✅ Functional</Badge>}
                       {prefs?.analytics ? <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black px-3 h-6 rounded-full">✅ Analytics</Badge> : <Badge className="bg-muted text-muted-foreground border-none uppercase text-[8px] font-black px-3 h-6 rounded-full">❌ Analytics</Badge>}
                       {prefs?.marketing ? <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[8px] font-black px-3 h-6 rounded-full">✅ Marketing</Badge> : <Badge className="bg-muted text-muted-foreground border-none uppercase text-[8px] font-black px-3 h-6 rounded-full">❌ Marketing</Badge>}
                    </div>
                 </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* SECTION 2: MANAGEMENT */}
          <div className="space-y-8">
             <div className="flex items-center gap-3 px-1">
                <Info size={16} className="text-primary" />
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-foreground">Manage Registry</h3>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {[
                  {
                    id: "necessary",
                    title: "Essential Cookies",
                    desc: "These cookies are strictly necessary for VoltaRentals to function. They enable core features like user authentication, booking state, security protocols, and fraud prevention.",
                    enabled: true,
                    locked: true
                  },
                  {
                    id: "functional",
                    title: "Functional Cookies",
                    desc: "These cookies enable enhanced features like saved search preferences, recently viewed vehicles, and your favorite vehicle list.",
                    enabled: localPrefs.functional,
                    onToggle: (v: boolean) => setLocalPrefs({...localPrefs, functional: v})
                  },
                  {
                    id: "analytics",
                    title: "Analytics Cookies",
                    desc: "These cookies help us understand how visitors interact with our platform through page view tracking and performance monitoring. All data is anonymous.",
                    enabled: localPrefs.analytics,
                    onToggle: (v: boolean) => setLocalPrefs({...localPrefs, analytics: v})
                  },
                  {
                    id: "marketing",
                    title: "Marketing Cookies",
                    desc: "Used to deliver relevant offers and track campaign effectiveness. We currently do not use marketing cookies, but this preference is saved for future deployments.",
                    enabled: localPrefs.marketing,
                    onToggle: (v: boolean) => setLocalPrefs({...localPrefs, marketing: v})
                  }
                ].map((cat, i) => (
                  <Card key={i} className="rounded-[2rem] border-border bg-card hover:border-primary/20 transition-all group overflow-hidden">
                    <CardContent className="p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                       <div className="space-y-3 flex-1">
                          <h4 className="text-lg font-black uppercase tracking-tight text-foreground">{cat.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-2xl">{cat.desc}</p>
                       </div>
                       <Switch 
                         checked={cat.enabled} 
                         disabled={cat.locked} 
                         onCheckedChange={cat.onToggle}
                       />
                    </CardContent>
                  </Card>
                ))}
             </div>

             <div className="flex flex-col sm:flex-row items-center gap-4 pt-10">
                <Button 
                  onClick={handleSave}
                  className="w-full sm:w-auto h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
                >
                  Commit Preferences
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  className="w-full sm:w-auto h-16 px-12 border-border text-muted-foreground font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-muted"
                >
                  <RefreshCw size={14} className="mr-3" /> Reset Registry
                </Button>
             </div>
          </div>

          {/* SECTION 3: INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-16 border-t border-border">
             <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground">What are cookies?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                   Cookies are small text files stored on your device when you visit a website. 
                   They help the website remember your preferences and provide a better, more secure experience.
                </p>
             </div>
             <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground">More Information</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-6">
                   For full details about how we handle your data, please read our official policy node.
                </p>
                <div className="flex flex-wrap gap-4">
                   <Button variant="outline" className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2">
                      <Phone size={14} className="text-primary" /> Call Concierge
                   </Button>
                   <Button variant="outline" className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2">
                      <MessageCircle size={14} className="text-emerald-500" /> WhatsApp Support
                   </Button>
                </div>
             </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
