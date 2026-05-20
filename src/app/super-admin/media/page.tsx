'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Save, ImageIcon, Video, Zap, 
  Upload, X, Camera, Grid, Layout
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import Image from 'next/image';

function MediaField({ label, value, onChange, icon, description }: any) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
      toast({ title: "Visual Registered ✨" });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-6 bg-white/5 border border-white/10 rounded-3xl group transition-all hover:border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon || <ImageIcon size={16} />}</div>
          <label className="text-[9px] font-black uppercase tracking-widest text-white/50">{label}</label>
        </div>
        {value && <Button variant="ghost" size="icon" onClick={() => onChange('')} className="h-6 w-6 text-white/20 hover:text-red-500"><X size={12} /></Button>}
      </div>

      <div className="flex gap-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-square w-24 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden group/thumb shrink-0"
        >
          {uploading ? <Loader2 className="animate-spin text-primary" /> : value ? <Image src={value} alt={label} fill className="object-cover p-1 rounded-xl" /> : <Upload size={20} className="opacity-20" />}
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
        <div className="flex-1 space-y-2">
          <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Visual URL node..." className="w-full h-10 bg-black/20 border border-white/5 rounded-xl px-4 text-[9px] font-mono" />
          <p className="text-[8px] text-white/20 italic">{description || "Recommended: Optimized PNG or SVG."}</p>
        </div>
      </div>
    </div>
  );
}

export default function MediaHubPage() {
  const [form, setForm] = useState<any>({
    heroVideoUrl: '', heroImageUrl: '', suvImageUrl: '', sedanImageUrl: '', vanImageUrl: '', luxuryImageUrl: '', systemLogo: '', faviconUrl: '', precisionImageUrl: '', aboutImageUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snap) => {
      if (snap.exists()) setForm(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'branding'), { ...form, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Visual Registry Synchronized! 📸" });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <div className="flex items-center justify-between border-b border-white/5 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Media Registry</h1>
          <p className="text-muted-foreground uppercase text-[10px] font-black tracking-widest italic">Global Visual Control Hub</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-16 px-12 bg-primary font-black uppercase tracking-widest text-[10px] rounded-xl shadow-2xl">
           {saving ? <Loader2 className="animate-spin h-5" /> : <Save size={18} className="mr-3" />} Commit Visuals
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="space-y-8">
           <div className="flex items-center gap-3"><Zap className="text-primary h-5 w-5" /><h2 className="text-sm font-black uppercase tracking-[0.4em]">Brand & Hero</h2></div>
           <MediaField label="Primary Logo" value={form.systemLogo} onChange={(v:any) => setForm({...form, systemLogo: v})} />
           <MediaField label="Favicon (ICO/PNG)" value={form.faviconUrl} onChange={(v:any) => setForm({...form, faviconUrl: v})} description="Used for browser tabs. Recommended: Square ICO/PNG." />
           <MediaField label="Hero Video (MP4)" icon={<Video size={16}/>} value={form.heroVideoUrl} onChange={(v:any) => setForm({...form, heroVideoUrl: v})} />
           <MediaField label="Hero Image (Fallback)" value={form.heroImageUrl} onChange={(v:any) => setForm({...form, heroImageUrl: v})} />
        </div>

        <div className="space-y-8">
           <div className="flex items-center gap-3"><Grid className="text-primary h-5 w-5" /><h2 className="text-sm font-black uppercase tracking-[0.4em]">Category Covers</h2></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MediaField label="SUV Cover" value={form.suvImageUrl} onChange={(v:any) => setForm({...form, suvImageUrl: v})} />
              <MediaField label="Sedan Cover" value={form.sedanImageUrl} onChange={(v:any) => setForm({...form, sedanImageUrl: v})} />
              <MediaField label="Van Cover" value={form.vanImageUrl} onChange={(v:any) => setForm({...form, vanImageUrl: v})} />
              <MediaField label="Luxury Cover" value={form.luxuryImageUrl} onChange={(v:any) => setForm({...form, luxuryImageUrl: v})} />
              <MediaField label="About Cover" value={form.aboutImageUrl} onChange={(v:any) => setForm({...form, aboutImageUrl: v})} />
              <MediaField label="Precision Cover" value={form.precisionImageUrl} onChange={(v:any) => setForm({...form, precisionImageUrl: v})} description="Cover for the 'Precision Mobility' section on home." />
           </div>
        </div>
      </div>
    </div>
  );
}
