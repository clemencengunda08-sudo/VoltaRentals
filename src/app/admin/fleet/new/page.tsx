'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Camera, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Info,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FEATURES = [
  'Air Conditioning', 'GPS Navigation', 'Bluetooth Audio', 'USB Charging',
  'Backup Camera', 'Sunroof', 'Child Seat Available', '4WD/AWD',
  'Leather Seats', 'Cruise Control', 'With Driver Available', 'Airport Pickup'
];

export default function NewVehiclePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: 2026,
    licensePlate: '',
    color: '',
    category: 'Sedan',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerDay: 0,
    weekendRate: 0,
    weeklyRate: 0,
    securityDeposit: 0,
    available: true,
    description: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('upload_preset', uploadPreset || '');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) uploadedUrls.push(data.secure_url);
      }
      setImages(prev => [...prev, ...uploadedUrls].slice(0, 8));
      toast({ title: 'Imagery Synchronized! 📸' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast({ variant: 'destructive', title: 'Action required', description: 'At least one vehicle image is mandatory.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'cars'), {
        ...form,
        features: selectedFeatures,
        images,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: 'Vehicle Registered Successfully! 🎉' });
      router.push('/admin/fleet');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Registration failed' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-32">
      <div className="flex items-center gap-6">
        <Link href="/admin/fleet">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-white hover:bg-white/5 border border-white/5">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Add Vehicle</h1>
          <p className="text-[hsl(213,25%,65%)] mt-2 font-medium">Provision a new logistical asset for the 2026 fleet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: Imagery */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Vehicle Imagery Registry</Label>
            <div className={cn(
              "relative h-64 border-2 border-dashed border-[hsl(220,35%,25%)] rounded-[2.5rem] bg-[hsl(220,38%,14%)] flex flex-col items-center justify-center group transition-all cursor-pointer overflow-hidden",
              uploading && "animate-pulse opacity-50"
            )}>
              <Input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={uploading}
              />
              <div className="text-center space-y-4 group-hover:scale-110 transition-transform">
                <div className="h-16 w-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  {uploading ? <Loader2 className="animate-spin" /> : <Camera size={32} />}
                </div>
                <div>
                  <p className="text-white font-black uppercase tracking-widest text-[11px]">Upload Registry Photos</p>
                  <p className="text-[hsl(213,25%,45%)] text-[9px] font-bold mt-1 uppercase tracking-widest">Supports multiple JPEG/PNG (Max 8)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group shadow-xl">
                  <Image src={url} alt="Vehicle" fill className="object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 h-7 w-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[7px] font-black text-center py-1 uppercase tracking-widest">
                      Primary Display
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck size={100} className="text-white" />
            </div>
            <h3 className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
              <ShieldCheck size={16} /> Asset Security Protocol
            </h3>
            <p className="text-blue-100/60 text-[11px] font-medium leading-relaxed italic">
              "Every vehicle added must undergo a physical 50-point inspection before it is marked available for elite customer reservations."
            </p>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="lg:col-span-7 space-y-10">
          <Card className="bg-[hsl(220,43%,11%)] border-[hsl(220,35%,18%)] rounded-[2.5rem] p-10 shadow-2xl">
            <CardContent className="p-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Manufacturer / Make</Label>
                  <Input value={form.make} onChange={e => setForm({...form, make: e.target.value})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 rounded-xl text-white font-bold" placeholder="e.g. Toyota" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Specific Model</Label>
                  <Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 rounded-xl text-white font-bold" placeholder="e.g. Land Cruiser V8" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Registry Year</Label>
                  <Input type="number" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 rounded-xl text-white font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">License Plate ID</Label>
                  <Input value={form.licensePlate} onChange={e => setForm({...form, licensePlate: e.target.value.toUpperCase()})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 rounded-xl text-white font-mono font-black" placeholder="T 123 ABC" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Vehicle Category</Label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full bg-[hsl(220,38%,14%)] border border-[hsl(220,35%,18%)] h-12 rounded-xl px-4 text-white font-bold outline-none appearance-none"
                  >
                    {['Sedan', 'SUV', 'Van', 'Luxury', 'Truck', 'Convertible', 'Pickup'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Transmission Type</Label>
                  <select 
                    value={form.transmission} 
                    onChange={e => setForm({...form, transmission: e.target.value})}
                    className="w-full bg-[hsl(220,38%,14%)] border border-[hsl(220,35%,18%)] h-12 rounded-xl px-4 text-white font-bold outline-none appearance-none"
                  >
                    <option value="Automatic">Automatic Transmission</option>
                    <option value="Manual">Manual Transmission</option>
                  </select>
                </div>
              </div>

              <div className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-8">
                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-500" /> Operational Pricing (TZS)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Daily Reserve Rate</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(213,25%,45%)] font-black text-xs">TSh</span>
                      <Input type="number" value={form.pricePerDay} onChange={e => setForm({...form, pricePerDay: parseInt(e.target.value)})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 pl-12 rounded-xl text-white font-black" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Security Settlement (Refundable)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(213,25%,45%)] font-black text-xs">TSh</span>
                      <Input type="number" value={form.securityDeposit} onChange={e => setForm({...form, securityDeposit: parseInt(e.target.value)})} className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] h-12 pl-12 rounded-xl text-white font-black" required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <Plus size={16} className="text-primary" /> Core Amenities & Features
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4">
                  {FEATURES.map(feature => (
                    <div key={feature} className="flex items-center gap-3">
                      <Checkbox 
                        id={feature} 
                        checked={selectedFeatures.includes(feature)} 
                        onCheckedChange={() => handleFeatureToggle(feature)}
                        className="h-5 w-5 rounded-lg border-[hsl(220,35%,25%)] data-[state=checked]:bg-primary"
                      />
                      <label htmlFor={feature} className="text-xs font-bold text-[hsl(213,25%,65%)] cursor-pointer select-none">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[hsl(213,25%,72%)]">Asset Briefing / Description</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="bg-[hsl(220,38%,14%)] border-[hsl(220,35%,18%)] min-h-[120px] rounded-2xl p-4 text-white text-sm" 
                  placeholder="Provide essential details about the vehicle's condition and heritage..." 
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-[hsl(220,38%,14%)] rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Initial Availability</p>
                  <p className="text-[9px] text-[hsl(213,25%,45%)] font-bold mt-1 uppercase tracking-widest">List on public fleet page immediately</p>
                </div>
                <Switch checked={form.available} onCheckedChange={v => setForm({...form, available: v})} />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || uploading}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-lg rounded-2xl shadow-2xl transition-all active:scale-95 gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                {isSubmitting ? 'Finalizing Registry...' : 'Complete Vehicle Registration'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}