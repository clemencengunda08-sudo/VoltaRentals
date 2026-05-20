'use client';

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  CheckCircle2, 
  Loader2, 
  Plane, 
  Calendar as CalendarIcon,
  Clock,
  Zap,
} from "lucide-react";
import { addDays, differenceInCalendarDays, format, differenceInDays } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, setDoc, getDoc, getDocs, serverTimestamp, query, where, limit } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TZ_AIRPORTS = [
  "Julius Nyerere International (DAR)",
  "Kilimanjaro International (JRO)", 
  "Abeid Amani Karume (ZNZ)",
  "Mwanza Airport (MWZ)",
  "Dodoma Airport (DOD)",
];

const formSchema = z.object({
  vehicleId: z.string().min(1, "Asset selection required"),
  tripPurpose: z.string().min(1, "Mission type required"),
  location: z.string().min(1, "Hub selection required"),
  pickupLocation: z.string().min(5, "Detailed pickup location required"),
  isAirportPickup: z.boolean().default(false),
  airportName: z.string().optional(),
  startDate: z.date({ required_error: "Commencement date required" }),
  endDate: z.date({ required_error: "Return date required" }),
  pickupTime: z.string().default("09:00 AM"),
  returnTime: z.string().default("09:00 AM"),
  phoneNumber: z.string().min(10, "Valid phone required"),
  specialRequirements: z.string().optional(),
  withDriver: z.boolean().default(false),
  driverLanguage: z.string().default("sw"),
  insuranceTier: z.string().default("basic"),
}).refine((data) => data.endDate >= data.startDate, {
  message: "Return date must be after commencement date",
  path: ["endDate"],
});

export function BookingFormClient() {
  const router = useRouter();
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialModelId = searchParams.get("model");

  const { data: profile } = useDoc(user ? doc(db, 'users', user.uid) : null);

  const carsQuery = useMemoFirebase(() => {
    return query(collection(db, "cars"), where("available", "==", true), limit(50));
  }, [db]);

  const { data: rawCars, loading: carsLoading } = useCollection(carsQuery);
  const cars = useMemo(() => {
    if (!rawCars) return [];
    return rawCars.filter((car: any) => {
      if (car.latraExpiry && differenceInDays(new Date(car.latraExpiry), new Date()) < 0) return false;
      if (car.insuranceExpiry && differenceInDays(new Date(car.insuranceExpiry), new Date()) < 0) return false;
      return true;
    });
  }, [rawCars]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: initialModelId || "",
      tripPurpose: "personal",
      location: "Dar es Salaam",
      pickupLocation: "Mikocheni Area, DSM",
      isAirportPickup: false,
      airportName: TZ_AIRPORTS[0],
      phoneNumber: "",
      specialRequirements: "",
      withDriver: false,
      driverLanguage: "sw",
      insuranceTier: "basic",
      startDate: new Date(),
      endDate: new Date(),
      pickupTime: "12:00 PM",
      returnTime: "12:00 PM",
    },
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (profile?.phoneNumber) {
      form.setValue('phoneNumber', profile.phoneNumber);
    }
  }, [profile, form]);

  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');

  useEffect(() => {
    if (watchStartDate && watchEndDate && watchEndDate < watchStartDate) {
      form.setValue('endDate', watchStartDate);
    }
  }, [watchStartDate, watchEndDate, form]);

  const watchValues = form.watch();
  const selectedCar = cars?.find(c => c.id === watchValues.vehicleId);

  const getAvailableTimes = (selectedDate: Date | undefined) => {
    const allTimes = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    if (!selectedDate) return allTimes;
    
    const now = new Date();
    const isToday = selectedDate.getDate() === now.getDate() &&
                    selectedDate.getMonth() === now.getMonth() &&
                    selectedDate.getFullYear() === now.getFullYear();
                    
    if (!isToday) return allTimes;
    
    const currentHour = now.getHours();
    return allTimes.filter(t => {
      let hour = parseInt(t.split(':')[0]);
      const isPM = t.includes('PM');
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      return hour > currentHour;
    });
  };

  const priceBreakdown = useMemo(() => {
    if (!selectedCar || !watchValues.startDate || !watchValues.endDate) return null;
    
    const days = Math.max(1, differenceInCalendarDays(watchValues.endDate, watchValues.startDate) + 1);
    const baseRate = selectedCar.pricePerDay * days;
    const driverFee = watchValues.withDriver ? (selectedCar.withDriverCostPerDay || 50000) * days : 0;
    const airportFee = watchValues.isAirportPickup ? 20000 : 0;
    
    return {
      days,
      baseRate,
      driverFee,
      airportFee,
      total: baseRate + driverFee + airportFee
    };
  }, [selectedCar, watchValues]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please sign in to make a booking." });
      return;
    }
    if (!selectedCar) {
      toast({ variant: "destructive", title: "Select a Vehicle", description: "Please choose a vehicle from the fleet first." });
      return;
    }
    if (!priceBreakdown) {
      toast({ variant: "destructive", title: "Set Dates", description: "Please select valid start and end dates." });
      return;
    }
    
    setIsSubmitting(true);
    
    const bookingsRef = collection(db, "bookings");
    
    // ----------------------------------------------------
    // DOUBLE BOOKING PREVENTION LOGIC
    // ----------------------------------------------------
    try {
      const overlapQuery = query(
        bookingsRef,
        where("vehicleId", "==", values.vehicleId),
        where("status", "in", ["pending", "confirmed", "active"])
      );
      const snap = await getDocs(overlapQuery);
      let hasOverlap = false;
      const requestedStart = values.startDate.getTime();
      const requestedEnd = values.endDate.getTime();

      for (const docSnap of snap.docs) {
        const existing = docSnap.data();
        
        // Timeout check: if pending for > 20 minutes, treat as abandoned
        if (existing.status === 'pending' && existing.createdAt) {
          const createdTime = existing.createdAt.toDate ? existing.createdAt.toDate().getTime() : new Date(existing.createdAt).getTime();
          const minutesPending = (Date.now() - createdTime) / (1000 * 60);
          if (minutesPending > 20) {
            continue; // Skip this one, it's abandoned
          }
        }

        const existStart = new Date(existing.startDate).getTime();
        const existEnd = new Date(existing.endDate).getTime();

        // Check date overlap
        if (requestedStart <= existEnd && requestedEnd >= existStart) {
          hasOverlap = true;
          break;
        }
      }

      if (hasOverlap) {
        toast({ 
          variant: "destructive", 
          title: "Asset Unavailable", 
          description: "This vehicle is already reserved for the selected dates. Please choose different dates or another vehicle." 
        });
        setIsSubmitting(false);
        return;
      }
    } catch (e) {
      console.error("Failed to verify availability:", e);
      // We will allow it to proceed if Firebase rules block querying or network fails, 
      // but ideally this catches conflicts cleanly.
    }

    const newDocRef = doc(bookingsRef);
    
    const bookingData = {
      id: newDocRef.id,
      bookingCode: `VOLTA-${newDocRef.id.slice(-6).toUpperCase()}`,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Client',
      userPhone: values.phoneNumber,
      vehicleId: values.vehicleId,
      vehicleName: `${selectedCar.make} ${selectedCar.model}`,
      vehiclePlate: selectedCar.plateNumber || '',
      vehicleImage: selectedCar.images?.[0] || "",
      pricePerDay: selectedCar.pricePerDay,
      totalDays: priceBreakdown.days,
      baseRate: priceBreakdown.baseRate,
      driverFee: priceBreakdown.driverFee,
      airportFee: priceBreakdown.airportFee,
      totalPrice: priceBreakdown.total,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      pickupLocation: values.pickupLocation,
      pickupTime: values.pickupTime,
      returnTime: values.returnTime,
      tripPurpose: values.tripPurpose,
      location: values.location,
      isAirportPickup: values.isAirportPickup,
      airportName: values.airportName || '',
      withDriver: values.withDriver,
      driverLanguage: values.driverLanguage,
      insuranceTier: values.insuranceTier,
      specialRequirements: values.specialRequirements || '',
      status: "pending",
      paymentStatus: "unpaid",
      amountPaid: 0,
      source: "web",
      paymentUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${newDocRef.id}/payment`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(newDocRef, bookingData);
      
      // Trigger n8n Automation (Async)
      try {
        const brandingDoc = await getDoc(doc(db, 'settings', 'branding'));
        const n8nBaseUrl = brandingDoc.exists() ? brandingDoc.data().n8nWebhookUrl : null;
        
        if (n8nBaseUrl) {
          // Send to the live webhook endpoint
          fetch(`${n8nBaseUrl}/volta-booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
          }).catch(err => console.warn("Automation trigger failed (silent):", err));
        }
      } catch (e) {
        console.warn("Could not trigger automation:", e);
      }

      setSubmittedData(bookingData);
      toast({ title: "✅ Booking Submitted!", description: `Reference: ${bookingData.bookingCode}` });
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast({ 
        variant: "destructive", 
        title: "Submission Failed", 
        description: error?.message || "Could not save your booking. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedData) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <Card className="rounded-[2.5rem] border-none shadow-3xl bg-card overflow-hidden">
          <div className="bg-primary p-8 text-center text-white">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Oda Imepokelewa</h2>
            <p className="text-sm opacity-80 mt-2">Nambari ya Oda: {submittedData.bookingCode}</p>
          </div>
          <CardContent className="p-8">
            <Button asChild className="w-full h-14 bg-primary font-black uppercase text-[10px] rounded-xl shadow-xl">
              <Link href={`/booking/${submittedData.id}/payment`}>Lipa Sasa (Proceed to Payment)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 pb-20">
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[2rem] border-border bg-card p-6 md:p-10 shadow-xl space-y-10">
              
              {/* PHASE 1: IDENTITY & ASSET */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">1</Badge> 
                  Registry & Asset Allocation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Dispatch Phone ID</FormLabel>
                      <FormControl><Input className="h-14 rounded-xl bg-muted border-none font-bold text-foreground" placeholder="+255..." {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="vehicleId" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Select Registry Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-14 rounded-xl bg-muted border-none font-bold uppercase text-[11px] text-foreground"><SelectValue placeholder="Choose Vehicle from Fleet" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-card border-border rounded-xl">
                          {carsLoading ? (
                            <div className="p-4 text-center text-xs animate-pulse font-bold">Synchronizing Fleet...</div>
                          ) : cars?.map(v => (
                            <SelectItem key={v.id} value={v.id} className="font-bold text-[11px] uppercase text-foreground">
                              {v.model.toLowerCase().startsWith(v.make.toLowerCase()) ? v.model : `${v.make} ${v.model}`} (TSh {v.pricePerDay.toLocaleString()}/day)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* PHASE 2: LOGISTICAL WINDOW (THE CALENDAR) */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">2</Badge> 
                  Logistical Window & Timing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* DATE RANGE SELECTOR */}
                  <div className="space-y-4">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Expedition Period</FormLabel>
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("h-14 w-full justify-start text-left font-bold bg-muted border-none rounded-xl px-5 text-foreground gap-3", !watchValues.startDate && "text-muted-foreground")}>
                            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                            {watchValues.startDate ? (
                              watchValues.endDate && watchValues.endDate > watchValues.startDate ? (
                                <span className="truncate">
                                  {format(watchValues.startDate, "MMM dd, yyyy")} — {format(watchValues.endDate, "MMM dd, yyyy")}
                                </span>
                              ) : (
                                <span>{format(watchValues.startDate, "MMM dd, yyyy")} (Single Day)</span>
                              )
                            ) : (
                              "Select Journey Dates"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar 
                            mode="range" 
                            selected={{
                              from: watchValues.startDate,
                              to: watchValues.endDate
                            }}
                            onSelect={(range) => {
                              if (range) {
                                const from = range.from || new Date();
                                const to = range.to || from;
                                form.setValue("startDate", from);
                                form.setValue("endDate", to);
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              return date < today;
                            }} 
                            initialFocus 
                          />
                        </PopoverContent>
                      </Popover>
                    )} />
                  </div>

                  {/* PICKUP & RETURN TIMES */}
                  <div className="space-y-4">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Pickup & Return Timing</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="pickupTime" render={({ field }) => (
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-muted-foreground ml-1">Pickup</span>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-14 bg-muted border-none rounded-xl font-bold uppercase text-[11px] text-foreground"><Clock className="mr-2 h-3.5 w-3.5 text-primary shrink-0" /><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-xl">
                              {getAvailableTimes(watchValues.startDate).map(t => <SelectItem key={t} value={t} className="font-bold text-[11px] text-foreground">{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )} />
                      <FormField control={form.control} name="returnTime" render={({ field }) => (
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-muted-foreground ml-1">Return</span>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-14 bg-muted border-none rounded-xl font-bold uppercase text-[11px] text-foreground"><Clock className="mr-2 h-3.5 w-3.5 text-primary shrink-0" /><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-xl">
                              {getAvailableTimes(watchValues.endDate).map(t => <SelectItem key={t} value={t} className="font-bold text-[11px] text-foreground">{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )} />
                    </div>
                  </div>
                </div>
              </div>

              {/* PHASE 3: MISSION PARAMETERS */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">3</Badge> 
                  Mission Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Specific Pickup Node</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-14 rounded-xl bg-muted border-none font-bold uppercase text-[11px] text-foreground"><SelectValue placeholder="Select District / Area" /></SelectTrigger></FormControl>
                        <SelectContent className="bg-card border-border rounded-xl">
                          {[
                            'Airport (JNIA)', 'Masaki', 'Oysterbay', 'Mikocheni', 'Posta (City Center)',
                            'Upanga', 'Kariakoo', 'Mbezi Beach', 'Tegeta', 'Goba', 'Sinza',
                            'Kijitonyama', 'Tabata', 'Kigamboni', 'Dar es Salaam (Other)'
                          ].map(loc => (
                            <SelectItem key={loc} value={loc} className="font-bold text-[11px] uppercase">{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2 p-6 bg-muted/40 rounded-2xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Plane size={24} /></div>
                      <div>
                        <p className="text-xs font-black uppercase">Airport Reception Protocol</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">+TSh 20,000 Surcharge</p>
                      </div>
                    </div>
                    <FormField control={form.control} name="isAirportPickup" render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )} />
                  </div>
                  {watchValues.isAirportPickup && (
                    <FormField control={form.control} name="airportName" render={({ field }) => (
                      <FormItem className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Selection of Hub</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="h-14 rounded-xl bg-muted border-none font-bold uppercase text-[11px]"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-card border-border rounded-xl">
                            {TZ_AIRPORTS.map(a => <SelectItem key={a} value={a} className="font-bold text-[11px] uppercase">{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  )}
                  <div className="md:col-span-2 p-6 bg-muted/40 rounded-2xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner"><CheckCircle2 size={24} /></div>
                      <div>
                        <p className="text-xs font-black uppercase">Professional Chauffeur</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">+TSh 50,000 / Day</p>
                      </div>
                    </div>
                    <FormField control={form.control} name="withDriver" render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )} />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-[2.5rem] bg-card border-none shadow-3xl overflow-hidden sticky top-28">
              <div className="bg-primary p-8 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><CalculatorIcon size={120} /></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 relative z-10">Total Logistical Investment</p>
                <h4 className="text-4xl md:text-5xl font-black tracking-tighter relative z-10 mt-2">
                  TSh {priceBreakdown?.total.toLocaleString() || '0'}
                </h4>
                {priceBreakdown && (
                  <Badge variant="outline" className="mt-4 bg-white/10 border-white/20 text-white font-black uppercase text-[8px] px-3">
                    {priceBreakdown.days} Full Expedition Days
                  </Badge>
                )}
              </div>
              <CardContent className="p-10 space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between text-[11px] font-black uppercase border-b border-border pb-3">
                      <span className="text-muted-foreground">Asset Daily Rate</span>
                      <span className="text-foreground">TSh {selectedCar?.pricePerDay.toLocaleString() || '0'}</span>
                   </div>
                   <div className="flex justify-between text-[11px] font-black uppercase border-b border-border pb-3">
                      <span className="text-muted-foreground">Duration Node</span>
                      <span className="text-foreground">{priceBreakdown?.days || 0} Days</span>
                   </div>
                </div>

                {/* Terms and Conditions Agreement */}
                <div className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl border border-border">
                  <input 
                    type="checkbox" 
                    id="agreeTerms" 
                    checked={agreedToTerms} 
                    onChange={(e) => setAgreedToTerms(e.target.checked)} 
                    className="h-4.5 w-4.5 rounded border-border bg-muted text-primary focus:ring-primary mt-0.5 cursor-pointer accent-primary" 
                  />
                  <label htmlFor="agreeTerms" className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed cursor-pointer select-none">
                    I authorize this booking and agree to the <Link href="/terms" target="_blank" className="text-primary underline font-black">Terms & Conditions</Link> & <Link href="/privacy" target="_blank" className="text-primary underline font-black">Privacy Policy</Link> in full.
                  </label>
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting || !selectedCar || !priceBreakdown || !agreedToTerms} 
                  className={cn(
                    "w-full h-16 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl transition-all active:scale-95 gap-3",
                    agreedToTerms 
                      ? "bg-primary hover:bg-primary/90 shadow-primary/20 cursor-pointer" 
                      : "bg-muted text-muted-foreground shadow-none cursor-not-allowed opacity-60"
                  )}
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap size={18} fill="currentColor" />}
                  Reserve This Unit
                </Button>
                
                <p className="text-[9px] text-muted-foreground text-center font-medium leading-relaxed italic px-4">
                  "Registry nodes are verified via BOT-regulated gateways. Your logistical data is encrypted per Volta protocol."
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

function CalculatorIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}
