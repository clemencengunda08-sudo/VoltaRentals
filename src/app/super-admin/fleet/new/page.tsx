'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { 
  Zap, 
  Camera, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Info, 
  Settings2, 
  DollarSign 
} from 'lucide-react';
import Link from 'next/link';

const FEATURE_OPTIONS = [
  'Air Conditioning', 'GPS Navigation', 'Bluetooth Audio', 'USB Charging',
  'Backup Camera', 'Sunroof', 'Child Seat', '4WD/AWD',
  'Leather Seats', 'With Driver', 'Airport Pickup', 'Cruise Control',
  'First Aid Kit', 'WiFi Hotspot'
];

export default function AddCarPage() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'SUV',
    pricePerDay: '',
    withDriverCostPerDay: '50000',
    seats: 5,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    color: '',
    licensePlate: '',
    description: '',
    available: true,
    features: [] as string[],
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const selected = files.slice(0, 8);
    setImageFiles(selected);
    const previews = selected.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  }

  function removeImage(index: number) {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  }

  function toggleFeature(feature: string) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.make || !form.model || !form.pricePerDay || !form.description) {
      setError('MANDATORY PROTOCOL: Missing required specifications or description.');
      return;
    }

    if (imageFiles.length === 0) {
      setError('VISUAL ARCHIVE: At least one asset image is required.');
      return;
    }

    try {
      setSaving(true);
      setUploadProgress('Synchronizing Imagery...');

      const imageUrls = await uploadMultipleToCloudinary(
        imageFiles,
        (current, total) => {
          setUploadProgress(`Processing Archive ${current} of ${total}...`);
        }
      );

      setUploadProgress('Committing Registry Data...');

      await addDoc(collection(db, 'cars'), {
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        category: form.category,
        pricePerDay: Number(form.pricePerDay),
        withDriverCostPerDay: Number(form.withDriverCostPerDay),
        seats: Number(form.seats),
        fuelType: form.fuelType,
        transmission: form.transmission,
        color: form.color.trim(),
        plateNumber: form.licensePlate.trim().toUpperCase(),
        description: form.description.trim(),
        available: form.available,
        features: form.features,
        images: imageUrls,
        rating: 5,
        totalRentals: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'admin',
      });

      router.push('/super-admin/fleet');

    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Registry synchronization failed.');
      setSaving(false);
      setUploadProgress('');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 text-white font-body pb-32">
      
      {/* Header Protocol */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href='/super-admin/fleet' className="h-12 w-12 rounded-xl bg-card border border-white/10 flex items-center justify-center text-primary hover:bg-white/5 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">Provision Asset</h1>
            <p className="text-white/40 font-medium uppercase text-[8px] tracking-widest flex items-center gap-2">
              <Zap className="text-primary h-2.5 w-2.5 fill-current" /> Detailed deployment protocol.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
          <CheckCircle2 size={14} />
          <span className="text-[8px] font-black uppercase tracking-widest">Cloud Sync: Active</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-[10px] font-black text-red-500 uppercase tracking-widest">
          ⚠️ Protocol Aborted: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Visual Archive */}
        <div className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Camera className="text-primary h-4 w-4" />
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Imagery Registry</h2>
             </div>
             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{imagePreviews.length}/8 Slots</span>
          </div>
          
          <div className="p-8">
            {imagePreviews.length === 0 ? (
              <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/5 transition-all group">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4 shadow-xl">
                   <Plus size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Initialize Visual Upload</span>
                <input type='file' accept='image/*' multiple onChange={handleImageSelect} className="hidden" />
              </label>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                      <img src={preview} alt='Asset' className="w-full h-full object-cover" />
                      <button 
                        type='button' 
                        onClick={() => removeImage(index)} 
                        className="absolute top-2 right-2 h-8 w-8 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                      >
                        <Plus className="rotate-45" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-3 px-8 h-12 bg-white text-black font-black uppercase text-[9px] tracking-widest rounded-xl cursor-pointer hover:bg-primary hover:text-white transition-all shadow-xl">
                  <Plus size={16} /> Append Photos
                  <input type='file' accept='image/*' multiple onChange={handleImageSelect} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
             <Settings2 className="text-primary h-4 w-4" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Core Specifications</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Manufacturer</label>
              <input type='text' placeholder='e.g. Toyota' value={form.make} onChange={(e) => setForm(f => ({ ...f, make: e.target.value }))} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl font-bold focus:border-primary outline-none text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Model Identifier</label>
              <input type='text' placeholder='e.g. Land Cruiser V8' value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl font-bold focus:border-primary outline-none text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Registry Year</label>
              <input type='number' value={form.year} onChange={(e) => setForm(f => ({ ...f, year: Number(e.target.value) }))} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl font-bold focus:border-primary outline-none text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">License Plate</label>
              <input type='text' placeholder='T 123 ABC' value={form.licensePlate} onChange={(e) => setForm(f => ({ ...f, licensePlate: e.target.value.toUpperCase() }))} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl font-black font-mono tracking-widest focus:border-primary outline-none text-sm" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Daily Reserve Rate (TSh)</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-[10px]">TSh</div>
                <input type='number' placeholder='150000' value={form.pricePerDay} onChange={(e) => setForm(f => ({ ...f, pricePerDay: e.target.value }))} className="w-full h-12 pl-12 pr-5 bg-primary/5 border border-primary/20 text-white rounded-xl font-black text-sm outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Classification</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest outline-none appearance-none cursor-pointer">
                {['SUV','Sedan','Van','Luxury','Truck','Pickup','Minibus'].map(c => (<option key={c} value={c} className="bg-slate-900">{c}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
             <Info className="text-primary h-4 w-4" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Asset Narrative</h2>
          </div>
          <div className="p-8">
            <textarea
              rows={4}
              placeholder="Provide essential details about the vehicle condition..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl font-medium focus:border-primary outline-none transition-all resize-none text-white/70 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Execution Terminal */}
        <button 
          type='submit' 
          disabled={saving} 
          className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4 text-xl"
        >
          {saving ? (
            <>
               <Loader2 className="animate-spin h-6 w-6" />
               <span className="text-sm">{uploadProgress || 'Processing...'}</span>
            </>
          ) : (
            <>
               <ShieldCheck size={28} />
               <span>Deploy Asset</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}