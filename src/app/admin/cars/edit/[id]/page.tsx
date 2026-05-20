'use client';

import { useState, useEffect, use } from 'react';
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Loader2, 
  Trash2,
  Camera,
  Zap,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  plateNumber: z.string().min(5, "Plate required"),
  category: z.enum(["SUV", "Sedan", "Van", "Bus", "Pickup", "Luxury", "Minibus"]),
  pricePerDay: z.coerce.number().min(1000),
  location: z.string().min(1, "Location required"),
  description: z.string().min(10, "Description required"),
  features: z.array(z.string()).default([]),
  seats: z.coerce.number().default(5),
  transmission: z.enum(["Automatic", "Manual"]).default("Automatic"),
  fuelType: z.enum(["Petrol", "Diesel", "Electric", "Hybrid"]).default("Diesel"),
  classTier: z.string().default("Comfortable"),
  latraExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});

type CarFormValues = z.infer<typeof carSchema>;

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const carRef = doc(db, "cars", id);
  const { data: car, loading: fetching } = useDoc(carRef);

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      make: "",
      model: "",
      year: 2026,
      plateNumber: "",
      category: "SUV",
      pricePerDay: 0,
      location: "Dar es Salaam",
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

  useEffect(() => {
    if (car) {
      form.reset({
        make: car.make || "",
        model: car.model || "",
        year: car.year || 2026,
        plateNumber: car.plateNumber || "",
        category: car.category || "SUV",
        pricePerDay: car.pricePerDay || 0,
        location: car.location || "Dar es Salaam",
        description: car.description || "",
        features: car.features || [],
        seats: car.seats || 5,
        transmission: car.transmission || "Automatic",
        fuelType: car.fuelType || "Diesel",
        classTier: car.classTier || "Comfortable",
        latraExpiry: car.latraExpiry || "",
        insuranceExpiry: car.insuranceExpiry || "",
      });
      const validImages = (car.images || []).filter((url: any) => typeof url === 'string' && url.length > 5);
      setImages(validImages);
    }
  }, [car, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await uploadToCloudinary(e.target.files[0]);
        if (url) {
          setImages(prev => [...prev, url]);
          toast({ title: "Visual Registered! 📸" });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Upload Protocol Failed" });
      } finally { setIsUploading(false); }
    }
  };

  const onAiGenerate = async () => {
    const values = form.getValues();
    if (!values.make || !values.model) return;
    setIsGenerating(true);
    try {
      const result = await generateCarDescription({
        make: values.make,
        model: values.model,
        year: values.year,
        category: values.category,
      });
      form.setValue('description', result.description);
    } catch (e) {
      toast({ variant: "destructive", title: "AI Intelligence Timeout" });
    } finally { setIsGenerating(false); }
  };

  const onSubmit = async (values: CarFormValues) => {
    setIsSubmitting(true);
    try {
      const updateData = sanitizeData({ 
        ...values, 
        images: images.filter(url => !!url),
        updatedAt: serverTimestamp() 
      });
      await updateDoc(carRef, updateData);

      notifyNewCar({ id, ...updateData, status: "Updated" });

      toast({ title: "Registry Synchronized! ✅" });
      router.push("/admin/cars");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Protocol Failed" });
    } finally { setIsSubmitting(false); }
  };

  if (fetching) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!car) return <div className="text-center py-20 font-black uppercase">Registry Entry Not Found</div>;

  return (
    <div className="space-y-12 pb-24">
      <div className="flex items-center gap-6">
        <Link href="/admin/cars"><Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-card border-border"><ArrowLeft size={20} /></Button></Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Modify Asset</h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground mt-1 tracking-widest">Registry ID: {car.plateNumber}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] flex items-center gap-3"><Camera className="text-primary h-5" /> Visual Archive</CardTitle>
              {isUploading && <Loader2 className="animate-spin text-primary h-4 w-4" />}
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    <Image src={url} alt="Car Visual" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {images.length < 8 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted transition-all group">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[8px] font-black uppercase text-muted-foreground mt-2 tracking-widest">Add Imagery</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] md:rounded-[3rem] border-border bg-card overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-10"><CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] flex items-center gap-3"><Zap className="text-primary h-5" /> Specifications</CardTitle></CardHeader>
            <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FormField control={form.control} name="make" render={({ field }) => (
                <FormItem><FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Manufacturer</FormLabel><FormControl><Input className="h-12 bg-muted border-none font-bold" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem><FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Unit Model</FormLabel><FormControl><Input className="h-12 bg-muted border-none font-bold" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Operational Hub</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[9px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {TZ_LOCATIONS.map(l => <SelectItem key={l} value={l} className="text-[9px] font-black uppercase">{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="pricePerDay" render={({ field }) => (
                <FormItem><FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Daily Rate (TSh)</FormLabel><FormControl><Input type="number" className="h-12 bg-muted border-none font-black text-emerald-500 text-lg" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="classTier" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Comfort Protocol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="h-12 bg-muted border-none font-bold uppercase text-[9px]"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="bg-card border-border">
                      {["Economical", "Comfortable", "Luxury"].map(c => <SelectItem key={c} value={c} className="text-[9px] font-black uppercase">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              
              <div className="md:col-span-2 pt-6 pb-2 border-b border-border">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4" /> Compliance & Expiry Protocol
                </h4>
              </div>
              <FormField control={form.control} name="latraExpiry" render={({ field }) => (
                <FormItem><FormLabel className="text-[9px] font-black uppercase text-primary ml-1">LATRA Permit Expiry</FormLabel><FormControl><Input type="date" className="h-12 bg-muted border-none font-bold" {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="insuranceExpiry" render={({ field }) => (
                <FormItem><FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Comprehensive Insurance Expiry</FormLabel><FormControl><Input type="date" className="h-12 bg-muted border-none font-bold" {...field} value={field.value || ''} /></FormControl></FormItem>
              )} />

              <div className="md:col-span-2 space-y-4 pt-4">
                <FormLabel className="text-[9px] font-black uppercase text-primary ml-1">Asset Amenities & Features</FormLabel>
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
                            <FormLabel className="text-[10px] font-bold text-foreground cursor-pointer uppercase">
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
                    <FormLabel className="text-[9px] font-black uppercase text-primary">Narrative Description</FormLabel>
                    <Button type="button" onClick={onAiGenerate} disabled={isGenerating} variant="ghost" className="h-7 px-3 rounded-lg text-[8px] font-black uppercase gap-2 bg-primary/10 text-primary hover:bg-primary/20">
                      {isGenerating ? <Loader2 className="animate-spin h-3 w-3" /> : <Sparkles className="h-3 w-3" />} Refine with AI
                    </Button>
                  </div>
                  <FormControl><Textarea className="min-h-[120px] rounded-2xl p-5 bg-muted border-none font-medium resize-none text-sm leading-relaxed" {...field} /></FormControl></FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-primary text-white font-black text-lg md:text-xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all gap-3">
              {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : "Commit Protocol Updates"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
