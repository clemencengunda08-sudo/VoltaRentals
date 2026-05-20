'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Camera, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Save,
  Trash2
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

export default function EditVehiclePage({ params }: { params: Promise<{ carId: string }> }) {
  const { carId } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadCar() {
      const snap = await getDoc(doc(db, 'cars', carId));
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          make: data.make || '',
          model: data.model || '',
          year: data.year || 2026,
          licensePlate: data.licensePlate || '',
          color: data.color || '',
          category: data.category || 'Sedan',
          seats: data.seats || 5,
          fuelType: data.fuelType || 'Petrol',
          transmission: data.transmission || 'Automatic',
          pricePerDay: data.pricePerDay || 0,
          weekendRate: data.weekendRate || 0,
          weeklyRate: data.weeklyRate || 0,
          securityDeposit: data.securityDeposit || 0,
          available: data.available ?? true,
          description: data.description || ''
        });
        setImages(data.images || []);
        setSelectedFeatures(data.features || []);
      }
      setLoading(false);
    }
    loadCar();
  }, [db, carId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'cars', carId), {
        ...form,
        features: selectedFeatures,
        images,
        updatedAt: serverTimestamp()
      });
      toast({ title: 'Vehicle Registry Synchronized! ✅' });
      router.push('/admin/fleet');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed' });
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      <div className="flex items-center gap-6">
        <Link href="/admin/fleet">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-white bg-card border border-border">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Edit {form.make}</h1>
          <p className="text-muted-foreground mt-2 font-medium">Updating asset parameters for {form.licensePlate}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-card border border-border rounded-[2.5rem] p-8">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 block">Asset Visual Archive</Label>
              <div className="grid grid-cols-3 gap-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border shadow-xl">
                    <Image src={url} alt="Vehicle" fill className="object-cover" />
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-7">
          <Card className="bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
            <CardContent className="p-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturer</Label>
                  <Input value={form.make} onChange={e => setForm({...form, make: e.target.value})} className="bg-muted border-none h-12 rounded-xl text-white font-bold" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Model Identifier</Label>
                  <Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="bg-muted border-none h-12 rounded-xl text-white font-bold" required />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 bg-primary md:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-lg rounded-2xl shadow-2xl transition-all active:scale-95 gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                {isSubmitting ? 'Synchronizing...' : 'Commit Protocol Updates'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
