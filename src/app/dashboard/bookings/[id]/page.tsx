'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Car, 
  CalendarDays, 
  Clock, 
  ShieldCheck, 
  XCircle, 
  Loader2,
  FileText,
  CreditCard,
  ArrowRight,
  MapPin,
  CheckCircle2,
  PenTool
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateBookingReceipt } from "@/lib/pdf-utils";
import Image from "next/image";
import { ShareButton } from "@/components/sharing/ShareButton";
import { SignaturePad } from "@/components/signature-pad";

/**
 * User Expedition Registry Detail.
 * Displays comprehensive details about the vehicle asset and mission logistics.
 */
export default function UserBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const bookingRef = doc(db, "bookings", id);
  const { data: booking, loading } = useDoc(bookingRef);

  /**
   * Safe Date Formatting Protocol.
   * Handles Firestore Timestamp, ISO Strings, and Date objects safely.
   */
  const safeFormatDate = (dateVal: any, pattern: string = "dd MMM yyyy, HH:mm") => {
    if (!dateVal) return 'Registry Syncing...';
    try {
      const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(dateObj.getTime())) return 'Registry Syncing...';
      return format(dateObj, pattern);
    } catch (e) {
      return 'Registry Syncing...';
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!confirm("Are you sure you want to ABORT this reservation protocol? This action is permanent.")) return;

    setIsUpdating(true);
    try {
      await updateDoc(bookingRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Protocol Aborted", description: "Your reservation has been cancelled." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (booking) generateBookingReceipt(booking, user);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!booking) return <div className="text-center py-20 font-black uppercase text-foreground">Registry Entry Not Found</div>;

  // Security Check: Only the owner or admin can see this
  if (user && booking.userId !== user.uid && !['admin', 'super_admin'].includes((user as any).role)) {
    return <div className="text-center py-20 font-black uppercase text-red-500">Access Denied: Node mismatch</div>;
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      active: 'bg-primary/10 text-primary border-primary/20',
      completed: 'bg-muted text-muted-foreground border-border',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return (
      <Badge className={cn("rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border", styles[status])}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-card border-border text-foreground"><ArrowLeft size={20} /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{booking.bookingCode}</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2 flex items-center gap-2">
              <Clock size={12} /> Logged: {safeFormatDate(booking.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {booking.status === 'pending' && (
            <Button 
              onClick={handleCancelBooking} 
              disabled={isUpdating}
              variant="outline" 
              className="h-14 px-8 border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2"
            >
              <XCircle size={18} /> Abort Reserve
            </Button>
          )}
          <Button onClick={handlePrint} className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20">
            <FileText size={18} /> Download Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          
          {/* VISUAL REGISTRY CARD */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl">
             <div className="relative aspect-[21/9] w-full overflow-hidden">
                {booking.vehicleImage ? (
                  <Image src={booking.vehicleImage} alt={booking.vehicleName} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center"><Car size={64} className="text-muted-foreground/20" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute bottom-6 left-8">
                   <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase tracking-widest px-3 h-6">{booking.vehiclePlate}</Badge>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter mt-2">{booking.vehicleName}</h2>
                </div>
             </div>
             <CardContent className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div className="space-y-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Asset Parameters</p>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-primary uppercase">Duration</p>
                              <p className="text-sm font-bold text-foreground">{booking.totalDays} Full Days</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-primary uppercase">Chauffeur</p>
                              <p className="text-sm font-bold text-foreground">{booking.driverIncluded || booking.withDriver ? 'Dispatched' : 'Self-Drive'}</p>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Itinerary Timeline</p>
                        <div className="p-6 bg-muted/40 rounded-3xl border border-border flex items-center justify-between">
                           <div className="text-center">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pickup</p>
                              <p className="text-sm font-black text-foreground">{safeFormatDate(booking.startDate, "dd MMM")}</p>
                           </div>
                           <ArrowRight className="text-primary/40" size={16} />
                           <div className="text-center">
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Return</p>
                              <p className="text-sm font-black text-foreground">{safeFormatDate(booking.endDate, "dd MMM")}</p>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Location Hub</p>
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                              <MapPin size={24} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground uppercase">{booking.pickupLocation || 'Main Hub, Dar es Salaam'}</p>
                              <p className="text-[9px] text-muted-foreground font-black uppercase mt-1 tracking-widest">Logistical Node</p>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Financial Summary (TSh)</p>
                         <div className="space-y-1">
                            <p className="text-4xl font-black text-foreground tracking-tighter">{booking.totalPrice?.toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                               <Badge variant="outline" className={cn(
                                 "text-[8px] font-black uppercase h-5",
                                 booking.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                               )}>
                                 {booking.paymentStatus === 'paid' ? 'Settled' : 'Pending'}
                               </Badge>
                               {booking.paymentStatus !== 'paid' && (
                                 <Link href={`/booking/${booking.id}/payment`} className="text-[9px] font-black text-primary uppercase hover:underline">Complete Payment →</Link>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* SHARE EXPERIENCE SECTION */}
          {(booking.status === 'confirmed' || booking.status === 'completed') && (
            <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Share your experience 🎉</h3>
                <p className="text-muted-foreground text-sm font-medium italic">Help others discover premium mobility in Tanzania.</p>
              </div>
              <ShareButton shareType="booking" data={booking} variant="button" />
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* SUPPORT DISPATCH */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-border bg-primary text-white">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] leading-none">Support Dispatch</h3>
             </div>
             <CardContent className="p-8 space-y-6">
                <div className="p-4 bg-muted rounded-2xl border border-border flex items-start gap-4">
                   <Clock className="text-primary shrink-0" size={16} />
                   <p className="text-[10px] text-muted-foreground leading-relaxed font-medium italic">
                      "Registry nodes for the 2026 fleet are monitored 24/7. Contact concierge for emergency protocol updates."
                   </p>
                </div>
                <div className="space-y-3">
                   <Button asChild variant="outline" className="w-full h-12 rounded-xl border-border font-black uppercase text-[10px] tracking-widest text-foreground hover:bg-muted transition-all">
                      <a href={`https://wa.me/255700000000?text=Inquiry%20regarding%20booking%20${booking.bookingCode}`} target="_blank">
                        Live WhatsApp Support
                      </a>
                   </Button>
                   <Button variant="outline" className="w-full h-12 rounded-xl border-border font-black uppercase text-[10px] tracking-widest text-foreground hover:bg-muted transition-all">
                      Email Operations
                   </Button>
                </div>
             </CardContent>
          </Card>

          {/* CHECKLIST */}
          <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] space-y-6 shadow-sm">
             <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
               <ShieldCheck size={14} /> Traveler Check-in
             </h4>
             <ul className="space-y-4">
                {[
                  "Valid National ID / Passport",
                  "Original Driving License",
                  "Payment Confirmation (Receipt)",
                  "Refundable Security Deposit"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{item}</span>
                  </li>
                ))}
             </ul>
          </div>

          {/* DIGITAL SIGNATURE CARD FOR CLIENT */}
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl mt-6">
            <div className="p-8 border-b border-border bg-muted/20">
              <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                <PenTool size={16} /> Digital Signature
              </h3>
            </div>
            <CardContent className="p-10 space-y-6">
              {booking.clientSignature ? (
                <div className="space-y-4 text-center">
                  <div className="bg-white border-2 border-dashed border-emerald-500/20 rounded-[1.5rem] p-4 flex justify-center shadow-inner">
                    <img src={booking.clientSignature} alt="Signature" className="h-20 object-contain" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 text-[10px] uppercase font-black tracking-widest w-full justify-center"><CheckCircle2 size={14} className="mr-2 inline" /> Contract Signed</Badge>
                </div>
              ) : (
                <>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium italic mb-2">"Please sign here to formally authorize the rental agreement."</p>
                  <SignaturePad bookingId={booking.id} />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
