'use client';

import { useState } from 'react';
import { THEMES, FONTS, type ThemeId, type FontId } from '@/lib/themes';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, CheckCircle2, Loader2, Monitor, Car, Zap, Type, LayoutTemplate, Volume2, VolumeX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useBranding } from '@/components/providers/BrandingProvider';
import { Switch } from '@/components/ui/switch';

export default function ThemeStudioPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { themeId: currentThemeId, fontId: currentFontId, enableSounds, setThemeId, setFontId } = useBranding();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleThemeChange = async (themeId: ThemeId) => {
    if (themeId === currentThemeId) return;
    setSwitching(themeId);
    
    try {
      setThemeId(themeId);
      await setDoc(doc(db, 'settings', 'branding'), {
        activeTheme: themeId,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'system'
      }, { merge: true });
      
      toast({
        title: `Color Palette Synced! ${THEMES[themeId].emoji}`,
        description: `${THEMES[themeId].name} is now live globally.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Cloud Sync Failed" });
    } finally {
      setSwitching(null);
    }
  };

  const handleFontChange = async (fontId: FontId) => {
    if (fontId === currentFontId) return;
    setSwitching(fontId);

    try {
      setFontId(fontId);
      await setDoc(doc(db, 'settings', 'branding'), {
        activeFont: fontId,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'system'
      }, { merge: true });

      toast({
        title: "Typography Deployed! ✍️",
        description: `Now using ${FONTS[fontId].name} for brand clarity.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Font Sync Failed" });
    } finally {
      setSwitching(null);
    }
  };

  const toggleSounds = async (enabled: boolean) => {
    try {
      await setDoc(doc(db, 'settings', 'branding'), {
        enableSounds: enabled,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'system'
      }, { merge: true });
      toast({ title: enabled ? "Audio Protocols Active 🔊" : "Silent Mode Engaged 🔇" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    }
  };

  return (
    <div className="space-y-16 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">Theme Studio</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">Fine-tune the visual DNA of VoltaRentals</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl flex items-center gap-4">
           <Zap className="text-primary h-5 w-5 fill-current animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Master Registry Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
        
        {/* SECTION: COLOR PALETTE */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
              <Palette className="text-primary h-6 w-6" />
              <h2 className="text-xl font-black uppercase tracking-tight">Color Palette Registry</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.values(THEMES).map((theme) => (
                <Card 
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id as ThemeId)}
                  className={cn(
                    "relative bg-card border border-border rounded-[2rem] p-6 cursor-pointer transition-all duration-500 overflow-hidden group",
                    theme.id === currentThemeId ? "ring-2 ring-primary ring-offset-4 ring-offset-background scale-[1.02] shadow-3xl" : "hover:border-primary/40 hover:-translate-y-1"
                  )}
                >
                  {theme.id === currentThemeId && (
                    <div className="absolute top-4 right-4"><Badge className="bg-emerald-500 text-white font-black uppercase text-[7px] px-2 h-5">LIVE</Badge></div>
                  )}
                  <div className="space-y-6">
                    <div className="text-5xl">{theme.emoji}</div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">{theme.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Master Palette</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                      <div className="h-6 w-6 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: `hsl(${theme.secondary})` }} />
                      <div className="h-6 w-6 rounded-full border border-white/10 shadow-lg" style={{ backgroundColor: `hsl(${theme.darkBg})` }} />
                    </div>
                  </div>
                </Card>
              ))}
           </div>
        </div>

        {/* SECTION: TYPOGRAPHY & AUDIO */}
        <div className="space-y-12">
           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <Type className="text-primary h-6 w-6" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Typography Protocols</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {Object.values(FONTS).map((font) => (
                   <Card 
                     key={font.id}
                     onClick={() => handleFontChange(font.id as FontId)}
                     className={cn(
                       "relative bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all flex items-center justify-between group",
                       font.id === currentFontId ? "border-primary bg-primary/5 shadow-xl" : "hover:border-primary/40"
                     )}
                   >
                     <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">Aa</div>
                        <div>
                           <h3 className="text-sm font-black text-white uppercase" style={{ fontFamily: font.heading }}>{font.name}</h3>
                           <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest" style={{ fontFamily: font.value }}>The quick brown fox jumps over the lazy dog.</p>
                        </div>
                     </div>
                     {font.id === currentFontId && <CheckCircle2 className="text-primary h-5 w-5" />}
                   </Card>
                 ))}
              </div>
           </div>

           <div className="space-y-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <Volume2 className="text-primary h-6 w-6" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Audio Protocols</h2>
              </div>
              <Card className="bg-card border border-border rounded-[2rem] p-8 flex items-center justify-between group hover:border-primary/20 transition-all">
                 <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       {enableSounds ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-white uppercase">System Interface Sounds</h3>
                       <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">Enable subtle clicks and feedback for elite UX.</p>
                    </div>
                 </div>
                 <Switch checked={enableSounds} onCheckedChange={toggleSounds} />
              </Card>
           </div>
        </div>

      </div>

      {/* SECTION: SYSTEM PREVIEW */}
      <div className="pt-20 space-y-8">
        <div className="flex items-center gap-3">
          <Monitor className="text-primary h-6 w-6" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Real-time Deployment Preview</h2>
        </div>

        <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-20 space-y-16 shadow-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
             <LayoutTemplate size={400} />
          </div>

          <div className="space-y-10 relative z-10">
             <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full">Protocol Preview</Badge>
                <h3 className="text-5xl lg:text-7xl font-black text-white uppercase leading-[0.85] tracking-tighter">
                   Drive the <br/><span className="text-primary italic">Expedition</span>
                </h3>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl italic">
                   "Experience the fusion of high-performance mechanics and elite typography for the modern Tanzanian executive."
                </p>
             </div>

             <div className="flex flex-wrap gap-4">
                <Button className="h-14 px-10 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl shadow-primary/20">Initialize Booking</Button>
                <Button variant="outline" className="h-14 px-10 border-border text-foreground font-black uppercase text-[10px] tracking-widest rounded-xl">Explore Fleet</Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
             {[1,2,3].map(i => (
               <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6 group hover:border-primary/30 transition-all">
                  <div className="aspect-[16/10] bg-muted rounded-2xl flex items-center justify-center overflow-hidden relative">
                     <Car className="h-12 w-12 text-primary opacity-20" />
                     <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-2">Category Node 0{i}</p>
                     <h4 className="text-lg font-black text-white uppercase">Asset Registry</h4>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="p-10 bg-primary/10 border border-dashed border-primary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-inner">
        <div className="flex gap-4 items-center">
           <CheckCircle2 className="text-primary h-8 w-8 shrink-0" />
           <p className="text-xs text-blue-100/60 font-black uppercase tracking-[0.2em] leading-relaxed">
             Sync Complete. Themes and Typography are deployed to all public and admin nodes instantly.
           </p>
        </div>
        {switching && (
          <div className="flex items-center gap-3 text-primary animate-pulse">
             <Loader2 className="animate-spin h-4 w-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Updating Registry...</span>
          </div>
        )}
      </div>
    </div>
  );
}
