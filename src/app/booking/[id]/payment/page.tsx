
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Receipt,
  Clock,
  MapPin,
  Plane,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Users,
  Copy,
  MessageCircle,
  Plus,
  Minus
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PesapalPayButton from "@/components/payments/PesapalPayButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranding } from "@/components/providers/BrandingProvider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from '@/hooks/use-toast';

const paymentFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  amount: z.number(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function BookingPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const bookingRef = doc(db, "bookings", id);
  const { data: booking, loading: bookingLoading } = useDoc(bookingRef);
  const { lipaNamba } = useBranding();

  const [countdown, setCountdown] = useState("");
  const [splitCount, setSplitCount] = useState(2);
  const [isAzamPayLoading, setIsAzamPayLoading] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      amount: 0,
    }
  });

  useEffect(() => {
    if (booking && user) {
      form.reset({
        name: user.displayName ?? '',
        email: user.email ?? '',
        phone: booking.userPhone ?? '',
        amount: booking.totalPrice ?? 0,
      });
    }
  }, [booking, user, form]);

  useEffect(() => {
    if (!booking || booking.status !== 'confirmed') return;
    const interval = setInterval(() => {
      const start = new Date(booking.startDate).getTime();
      const now = new Date().getTime();
      const diff = start - now;
      if (diff <= 0) {
        setCountdown("Expedition Started");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${days}d ${hours}h ${mins}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  if (userLoading || bookingLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!booking) return <div className="text-center py-20 font-black uppercase">Booking Registry Not Found</div>;

  const isPaid = booking.paymentStatus === "paid";
  const perPerson = Math.round((booking.totalPrice || 0) / splitCount);

  const shareText = `Hey! Join our Volta Rentals trip.
Your share is TSh ${perPerson.toLocaleString()}.
Book ref: ${booking.bookingCode}
Pay via M-Pesa: 0700 000 000

www.voltarentals.co.tz`;

  const copyShareText = () => {
    navigator.clipboard.writeText(shareText);
    toast({ title: "Message Copied", description: "Share with your group node." });
  };

  const BOOKING_STEPS = [
    { id: 1, label: "Booking Submitted", status: "done" },
    { id: 2, label: "Payment Processing", status: isPaid ? "done" : "active" },
    { id: 3, label: "Confirmed", status: (booking.status === 'confirmed' || booking.status === 'active') ? "done" : (isPaid ? "active" : "pending") },
    { id: 4, label: "Vehicle Dispatched", status: booking.status === 'active' ? "done" : (booking.status === 'confirmed' ? "active" : "pending") },
    { id: 5, label: "Mission Complete", status: booking.status === 'completed' ? "done" : "pending" },
  ];

  const handleAzamPayMock = async () => {
    setIsAzamPayLoading(true);
    try {
      // Simulate real MNO USSD push network delay (2.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      const res = await fetch('/api/payments/azampay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: id,
          mobileNumber: form.getValues('phone')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      
      toast({ title: 'Payment Success ✅', description: 'AzamPay Mock MNO Push Completed successfully' });
      
      // Delay reload slightly so they can read the success toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'AzamPay Error', description: e.message });
      setIsAzamPayLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, footer, header, button, a, .no-print, .flex.gap-4, .group-expedition-splitter {
            display: none !important;
          }
          body, main {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .executive-card {
            border: 1px solid #e2e8f0 !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
        }
      `}} />
      <main className="flex-1 py-12 bg-background pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                <ArrowLeft size={12} /> Back to Dashboard
              </Link>
              <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Settlement Hub</h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-primary rounded-lg border-primary/20 bg-card uppercase text-[10px]">{booking.bookingCode}</Badge>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Registry Status: {booking.status}</span>
              </div>
            </div>
            {!isPaid && (
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Investment</p>
                <p className="text-4xl font-black text-primary tracking-tighter leading-none">TSh {booking.totalPrice?.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN: TIMELINE & INFO */}
            <div className="lg:col-span-4 space-y-8">
              {/* TIMELINE CARD */}
              <div className="executive-card p-10 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary border-b border-border pb-4">
                  Expedition Journey
                </h3>
                <div className="relative space-y-8 pl-8 border-l-2 border-border ml-2">
                  {BOOKING_STEPS.map((step, i) => (
                    <div key={step.id} className="relative">
                      <div className={cn(
                        "absolute -left-[37px] top-0 h-4 w-4 rounded-full border-2 border-background z-10 transition-all",
                        step.status === 'done' ? "bg-primary border-primary" : 
                        step.status === 'active' ? "bg-background border-primary animate-pulse" : "bg-background border-border"
                      )} />
                      <div className="space-y-1">
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          step.status === 'done' ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </p>
                        {step.status === 'done' && <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Protocol Verified</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DELIVERY INFO CARD */}
              <div className="executive-card p-10 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Logistical Node</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Pickup Location</p>
                      <p className="text-xs font-bold text-foreground">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Schedule</p>
                      <p className="text-xs font-bold text-foreground">{booking.pickupTime} • Dispatch Ready</p>
                    </div>
                  </div>
                  {booking.isAirportPickup && (
                    <div className="flex items-start gap-4">
                      <Plane className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground">Airport Node</p>
                        <p className="text-xs font-bold text-foreground">{booking.airportName}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <Briefcase className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Mission Purpose</p>
                      <p className="text-xs font-bold text-foreground uppercase">{booking.tripPurpose}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PAYMENT / RECEIPT */}
            <div className="lg:col-span-8 space-y-8">
              {isPaid ? (
                <div className="space-y-8">
                  <div className="executive-card p-12 text-center space-y-8 border-primary/20 bg-primary/5">
                    <div className="h-20 w-20 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">Settlement Verified</h2>
                    
                    {booking.status === 'confirmed' && countdown && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Expedition Commencing In</p>
                        <p className="text-5xl font-black text-foreground tracking-tighter tabular-nums">{countdown}</p>
                      </div>
                    )}
                    
                    <p className="text-muted-foreground text-sm font-medium italic max-w-md mx-auto">
                      "Your registry credentials are now active. Welcome to the elite VoltaRentals 2026 fleet expedition."
                    </p>
                    <div className="flex gap-4">
                       <Button asChild className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-xl">
                        <Link href="/dashboard">Access Dashboard</Link>
                      </Button>
                      <Button 
                        onClick={() => window.print()} 
                        variant="outline" 
                        className="flex-1 h-14 border-border text-foreground font-black uppercase tracking-widest rounded-xl"
                      >
                        Print Receipt
                      </Button>
                    </div>
                  </div>

                  {/* GROUP SPLITTER NODE */}
                  <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 p-10 space-y-8 shadow-xl">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white"><Users size={20} /></div>
                           <div>
                              <h3 className="text-lg font-black uppercase tracking-tight">Group Expedition Splitter</h3>
                              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Gawana gharama za safari kitalamu</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-xl border border-border">
                           <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} className="text-primary"><Minus size={14} /></button>
                           <span className="font-black text-sm w-8 text-center">{splitCount} PAX</span>
                           <button onClick={() => setSplitCount(splitCount + 1)} className="text-primary"><Plus size={14} /></button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-primary/10 pt-8">
                        <div>
                           <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Per Person Settlement</p>
                           <h4 className="text-4xl font-black text-foreground tracking-tighter">TSh {perPerson.toLocaleString()}</h4>
                        </div>
                        <div className="flex gap-3">
                           <Button onClick={copyShareText} variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2">
                              <Copy size={14} /> Copy Protocol
                           </Button>
                           <Button asChild className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest gap-2">
                              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank">
                                 <MessageCircle size={14} /> WhatsApp
                              </a>
                           </Button>
                        </div>
                     </div>
                  </Card>

                  {/* ITEMISED BREAKDOWN ON SUCCESS */}
                  <div className="executive-card p-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Financial Protocol Breakdown</h3>
                      <TrendingUp size={16} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                      {(() => {
                        // Safely compute breakdown from stored fields
                        const totalDays = booking.totalDays ?? 
                          (booking.startDate && booking.endDate 
                            ? Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000*60*60*24)))
                            : 1);
                        const pricePerDay = booking.pricePerDay ?? 0;
                        const baseRate = booking.baseRate ?? (pricePerDay * totalDays);
                        const driverFee = booking.driverFee ?? 0;
                        const airportFee = booking.airportFee ?? 0;
                        const discountApplied = booking.discountApplied ?? 0;

                        const items = [
                          { 
                            label: "Vehicle Rental", 
                            sub: totalDays + " Day(s)" + (pricePerDay > 0 ? ` × TSh ${pricePerDay.toLocaleString()}` : ''), 
                            val: baseRate 
                          },
                          ...(driverFee > 0 ? [{ 
                            label: "Chauffeur Service", 
                            sub: `${totalDays} Days Premium`, 
                            val: driverFee 
                          }] : []),
                          ...(airportFee > 0 ? [{ 
                            label: "Airport Surcharge", 
                            sub: "Hub Transfer", 
                            val: airportFee 
                          }] : []),
                          ...(discountApplied > 0 ? [{ 
                            label: "Loyalty Discount", 
                            sub: "Applied", 
                            val: -discountApplied 
                          }] : []),
                        ];

                        return items.map((item, i) => (
                          <motion.div 
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex justify-between items-center group"
                          >
                            <div>
                              <p className="text-xs font-black uppercase text-foreground">{item.label}</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{item.sub}</p>
                            </div>
                            <p className={cn("text-sm font-black text-foreground", item.val < 0 && "text-emerald-500")}>
                               {item.val < 0 ? "-" : ""}TSh {Math.abs(item.val || 0).toLocaleString()}
                            </p>
                          </motion.div>
                        ));
                      })()}
                      <div className="pt-6 border-t border-border flex justify-between items-center">
                        <p className="text-sm font-black uppercase text-primary tracking-[0.2em]">Total Paid</p>
                        <p className="text-3xl font-black text-foreground tracking-tighter">TSh {booking.totalPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="executive-card p-10 lg:p-12 shadow-2xl space-y-12">
                  <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Initialize Settlement</h2>
                    <p className="text-muted-foreground text-sm font-medium">Verify your dispatch identity and select your preferred Tanzanian money terminal.</p>
                  </div>

                  <Form {...form}>
                    <form className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel className="font-black text-[9px] uppercase tracking-widest text-primary ml-1">Dispatch Identity</FormLabel>
                          <FormControl><Input placeholder="John Mwamba" {...field} value={field.value ?? ""} className="rounded-xl h-14 border-none bg-muted font-bold" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel className="font-black text-[9px] uppercase tracking-widest text-primary ml-1">Communication ID</FormLabel>
                          <FormControl><Input placeholder="+255..." {...field} value={field.value ?? ""} className="rounded-xl h-14 border-none bg-muted font-bold" /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="font-black text-[9px] uppercase tracking-widest text-primary ml-1">Registry Email</FormLabel>
                        <FormControl><Input type="email" placeholder="client@voltarentals.co.tz" {...field} value={field.value ?? ""} className="rounded-xl h-14 border-none bg-muted font-bold" /></FormControl><FormMessage /></FormItem>
                      )} />
                      
                      <div className="pt-8 border-t border-border">
                        <Tabs defaultValue="pesapal" className="w-full">
                          <TabsList className="flex flex-wrap h-auto gap-2 p-1 mb-6 bg-muted border border-border rounded-xl">
                            <TabsTrigger value="pesapal" className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest min-w-[140px]">Pesapal (Card)</TabsTrigger>
                            <TabsTrigger value="azampay" className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest min-w-[140px]">AzamPay (Mobile)</TabsTrigger>
                            <TabsTrigger value="manual" className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest min-w-[140px]">Lipa Namba</TabsTrigger>
                          </TabsList>
                          <TabsContent value="pesapal">
                            <PesapalPayButton 
                              bookingId={booking.id}
                              bookingCode={booking.bookingCode}
                              amount={booking.totalPrice}
                              customerEmail={form.watch('email') || user?.email || ''}
                              customerPhone={form.watch('phone') || booking.userPhone || ''}
                              customerName={form.watch('name') || user?.displayName || 'Valued Client'}
                              vehicleName={booking.vehicleName ?? 'Premium Asset'}
                            />
                          </TabsContent>
                          <TabsContent value="azampay">
                             <div className="bg-muted border border-border rounded-2xl p-8 text-center space-y-4">
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary">AZAMPAY MNO PUSH (TEST MODE)</p>
                               <div className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums bg-background text-foreground py-4 rounded-xl border-2 border-primary shadow-inner">
                                 TSh {booking.totalPrice?.toLocaleString()}
                               </div>
                               <p className="text-[10px] text-foreground uppercase font-black">PAY VIA TIGO, AIRTEL OR HALOPESA</p>
                               <div className="pt-4 space-y-2">
                                 <p className="text-[10px] font-medium leading-relaxed italic text-muted-foreground">Click below to simulate a successful AzamPay USSD push to your phone number ({form.watch('phone')}).</p>
                                 <Button 
                                   type="button" 
                                   onClick={handleAzamPayMock}
                                   disabled={isAzamPayLoading}
                                   className="w-full h-12 bg-[#0065b3] hover:bg-[#004e8a] text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg gap-2"
                                 >
                                   {isAzamPayLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Pay with AzamPay'}
                                 </Button>
                               </div>
                             </div>
                          </TabsContent>
                          <TabsContent value="manual">
                            <div className="bg-muted border border-border rounded-2xl p-8 text-center space-y-4">
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary">LIPA NAMBA (TIGO PESA / M-PESA / AIRTEL)</p>
                               <div className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums bg-background text-foreground py-4 rounded-xl border-2 border-primary shadow-inner">
                                 {lipaNamba || "555 5555"}
                               </div>
                               <p className="text-[10px] text-foreground uppercase font-black">VOLTA RENTALS LTD</p>
                               <div className="pt-4 space-y-2">
                                 <p className="text-[10px] font-medium leading-relaxed italic text-muted-foreground">After making the transfer, please share your confirmation message with our dispatch team.</p>
                                 <Button asChild className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg gap-2">
                                   <a href={`https://wa.me/?text=${encodeURIComponent(`Hello, I have made a manual settlement of TSh ${booking.totalPrice?.toLocaleString()} for booking ${booking.bookingCode}.`)}`} target="_blank">
                                     Notify Dispatch (WhatsApp)
                                   </a>
                                 </Button>
                               </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </form>
                  </Form>
                  
                  <div className="bg-primary/5 border border-dashed border-primary/20 rounded-2xl p-6 flex gap-4 items-start">
                    <ShieldCheck size={20} className="text-primary shrink-0" />
                    <p className="text-[9px] text-muted-foreground font-black uppercase leading-relaxed tracking-widest italic">
                      "All transactions are processed through BOT-regulated gateways. Secure encryption is enforced per Volta protocol 2026."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
