'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  X, 
  Loader2,
  Plus,
  Calculator,
  Zap,
  Camera,
  ShieldCheck,
  Sparkles,
  MapPin
} from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCarDescription } from '@/ai/flows/generate-car-description';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { sanitizeData } from '@/lib/utils';
import { notifyNewCar } from '@/lib/n8nWebhook';

const TZ_LOCATIONS = [
  "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Zanzibar", "Mbeya", "Tanga", "Morogoro", "Moshi", "Iringa"
];

const FEATURES = [
  "Air Conditioning", "GPS Navigation", "Bluetooth Audio", "USB Charging", 
  "Backup Camera", "Sunroof", "4WD/AWD", "Leather Seats", "Cruise Control", 
  "With Driver Available", "Child Seat Available", "WiFi Hotspot"
];

const carSchema = z.object({
  make: z.string().min(2, "Make required"),
  model: z.string().min(2, "Model required"),
  year: z.coerce.number().min(2000).max(2027),
  plateNumber: z.string().min(5, "Plate identifier too short"),
  category: z.enum(["SUV", "Sedan", "Van", "Bus", "Pickup", "Luxury", "Minibus"]),
  pricePerDay: z.coerce.number().min(1000, "Min TSh 1,000"),
  withDriverCostPerDay: z.coerce.number().default(50000),
  location: z.string().min(1, "Location required"),
  description: z.string().min(10, "Provide at least 10 characters description"),
  features: z.array(z.string()).default([]),
  seats: z.coerce.number().default(5),
  transmission: z.enum(["Automatic", "Manual"]).default("Automatic"),
  fuelType: z.enum(["Petrol", "Diesel", "Electric", "Hybrid"]).default("Diesel"),
  classTier: z.string().default("Comfortable"),
  latraExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});

type CarFormValues = z.infer<typeof carSchema>;

export default function AddCarPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      year: 2026,
      plateNumber: "",
      location: "Dar es Salaam",
      category: "SUV",
      pricePerDay: 150000,
      withDriverCostPerDay: 50000,
      description: "",
      features: [],
      seats: 5,
      transmission: "Automatic",
      fuelType: "Diesel",
      classTier: "Comfortable",
      latraExpiry: "",
      insuranceExpiry: "",
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onAiGenerate = async () => {
    const values = form.getValues();
    if (!values.make || !values.model) {
      toast({ variant: "destructive", title: "Specs Needed", description: "Please enter Make and Model first." });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCarDescription({
        make: values.make,
        model: values.model,
        year: values.year,
        category: values.category,
      });
      form.setValue('description', result.description);
      toast({ title: "Narrative Generated ✨" });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Sync Failed" });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: CarFormValues) => {
    if (imageFiles.length === 0) {
      toast({ variant: "destructive", title: "Visuals Mandatory", description: "At least one asset image is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        const url = await uploadToCloudinary(imageFiles[i]);
        if (url) imageUrls.push(url);
      }

      const carData = sanitizeData({ 
        ...values, 
        images: imageUrls, 
        available: true,
        rating: 5,
        totalRentals: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        addedBy: user?.uid || 'admin'
      });

      const docRef = await addDoc(collection(db, "cars"), carData);

      notifyNewCar({ id: docRef.id, ...carData });

      toast({ title: "Asset Deployed! 🚀" });
      router.push("/admin/cars");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deployment Failed", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center gap-6">
        <Link href="/admin/cars">
          <Button variant="outline" size="icon" className="rounded-xl bg-card border-border"><ArrowLeft size={20} /></Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Provision Asset</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Append a new logistical unit to the fleet.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-5xl">
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Camera className="text-primary h-5" /> Visual Registry</CardTitle>
              {isSubmitting && <span className="text-[10px] font-black text-primary">{uploadProgress}% SYNC</span>}
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted transition-all">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground mt-2">Add Image</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                </label>
              </div>
              {isSubmitting && <Progress value={uploadProgress} className="h-1.5" />}
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10"><CardTitle className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3"><Zap className="text-primary h-5" /> Specifications</CardTitle></CardHeader>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField control={form.control} name="make" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Manufacturer</FormLabel><FormControl><Input placeholder="Toyota" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Unit Model</FormLabel><FormControl><Input placeholder="Prado" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Registry Year</FormLabel><FormControl><Input type="number" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Operational Hub</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {TZ_LOCATIONS.map(l => <SelectItem key={l} value={l} className="text-[10px] font-black uppercase">{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Classification</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {["SUV", "Sedan", "Van", "Bus", "Pickup", "Luxury", "Minibus"].map(c => <SelectItem key={c} value={c} className="text-[10px] font-black uppercase">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="classTier" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Comfort Protocol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {["Economical", "Comfortable", "Luxury"].map(c => <SelectItem key={c} value={c} className="text-[10px] font-black uppercase">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="transmission" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Transmission</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {["Automatic", "Manual"].map(t => <SelectItem key={t} value={t} className="text-[10px] font-black uppercase">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="plateNumber" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Plate ID</FormLabel><FormControl><Input placeholder="T 123 ABC" className="h-12 bg-muted border-none font-black font-mono" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="seats" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Seating Capacity</FormLabel><FormControl><Input type="number" className="h-12 bg-muted border-none font-bold" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="md:col-span-2 pt-6 pb-2 border-b border-border">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4" /> Compliance & Expiry Protocol
                </h4>
              </div>
              <FormField control={form.control} name="latraExpiry" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">LATRA Permit Expiry</FormLabel><FormControl><Input type="date" className="h-12 bg-muted border-none font-bold" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="insuranceExpiry" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Comprehensive Insurance Expiry</FormLabel><FormControl><Input type="date" className="h-12 bg-muted border-none font-bold" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="md:col-span-2 space-y-4 pt-4">
                <FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Asset Amenities & Features</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-muted rounded-2xl">
                  {FEATURES.map((feature) => (
                    <FormField
                      key={feature}
                      control={form.control}
                      name="features"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(feature)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, feature])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== feature)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-[11px] font-bold text-foreground cursor-pointer uppercase">
                              {feature}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <FormLabel className="text-[10px] font-black uppercase text-primary">Asset Narrative</FormLabel>
                    <Button type="button" onClick={onAiGenerate} disabled={isGenerating} variant="ghost" className="h-7 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2 bg-primary/10 text-primary">
                      {isGenerating ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3" />} Generate with AI
                    </Button>
                  </div>
                  <FormControl><Textarea className="min-h-[120px] rounded-2xl bg-muted border-none p-5 font-medium resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-10"><CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-3 text-secondary"><Calculator className="h-5" /> Economic Logic</CardTitle></CardHeader>
            <CardContent className="p-10">
              <FormField control={form.control} name="pricePerDay" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-black uppercase text-primary ml-1">Daily Rate (TSh)</FormLabel><FormControl><Input type="number" className="h-14 bg-primary/5 border-none font-black text-primary text-xl" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting} className="w-full h-20 rounded-[2rem] bg-primary text-white font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 gap-4">
            {isSubmitting ? <Loader2 className="animate-spin h-6" /> : <ShieldCheck className="h-6" />}
            {isSubmitting ? "Finalizing Registry..." : "Commit Asset to Registry"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
