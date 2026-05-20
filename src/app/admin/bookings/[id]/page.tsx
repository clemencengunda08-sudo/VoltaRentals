'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Car, 
  FileText, 
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Zap,
  Sparkles,
  CreditCard,
  DollarSign,
  PenTool,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateRentalContract, generateBookingReceipt } from "@/lib/pdf-utils";
import { automation } from "@/lib/automation";
import { analyzeBooking } from "@/ai/flows/analyze-booking";
import { SignaturePad } from "@/components/signature-pad";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const bookingRef = doc(db, "bookings", id);
  const { data: booking, loading } = useDoc(bookingRef);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverName, setDriverName] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);

  useEffect(() => {
    if (booking) {
      setDriverName(booking.driverName || '');
      setAmountPaid(booking.amountPaid || 0);
    }
  }, [booking]);

  useEffect(() => {
    async function loadDrivers() {
      // Find all users with role 'driver'
      const q = query(collection(db, 'users'), where('role', '==', 'driver'));
      const snap = await getDocs(q);
      setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    loadDrivers();
  }, [db]);

  const handleRunAiAnalysis = async () => {
    if (!booking) return;
    setIsAnalyzing(true);
    try {
      const aiResult = await analyzeBooking({
        userName: booking.userName,
        tripPurpose: booking.tripPurpose || 'Standard',
        vehicleName: booking.vehicleName,
        totalPrice: booking.totalPrice,
        duration: booking.totalDays,
        pickupLocation: booking.pickupLocation,
        specialRequirements: booking.specialRequirements
      });

      await updateDoc(bookingRef, {
        aiPersonalityTag: aiResult.personalityTag,
        riskStatus: aiResult.riskStatus,
        riskReason: aiResult.riskReason,
        geminiInsight: aiResult.insight,
        updatedAt: serverTimestamp()
      });

      toast({ title: "Intelligence Refreshed ✨" });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Node Timeout" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateProtocol = async (status?: string) => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      const updateData: any = {
        driverName,
        amountPaid: Number(amountPaid),
        balanceDue: (booking.totalPrice || 0) - Number(amountPaid),
        updatedAt: serverTimestamp(),
      };
      
      if (status) updateData.status = status;
      
      // Auto-payment status update logic
      if (Number(amountPaid) >= booking.totalPrice) {
        updateData.paymentStatus = 'paid';
      } else if (Number(amountPaid) > 0) {
        updateData.paymentStatus = 'partial';
      }

      await updateDoc(bookingRef, updateData);
      
      // Trigger Automation for Accounting and WhatsApp
      automation.bookingStatusUpdated({ ...booking, ...updateData });
      
      toast({ title: "Registry Synchronized ✅" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!booking) return <div className="text-center py-20 uppercase font-black text-foreground">Registry Not Found</div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/bookings"><Button variant="outline" size="icon" className="rounded-xl border-border bg-card text-foreground"><ArrowLeft size={20} /></Button></Link>
          <div>
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{booking.bookingCode}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-primary/10 text-primary border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{booking.status}</Badge>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Logged: {booking.createdAt ? format(new Date(booking.createdAt?.toDate ? booking.createdAt.toDate() : booking.createdAt), "dd MMM yyyy") : 'Registry Pending'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
           <Button 
            onClick={handleRunAiAnalysis} 
            disabled={isAnalyzing}
            variant="outline"
            className="rounded-2xl h-14 border-primary/20 text-primary font-black uppercase text-xs gap-3"
          >
            {isAnalyzing ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw size={18} />}
            Analyze Mission
          </Button>
          <Button onClick={() => generateRentalContract(booking)} className="bg-card border border-border text-foreground rounded-2xl h-14 px-8 font-black uppercase text-xs gap-3 shadow-xl">
            <FileText size={18} /> Contract PDF
          </Button>
          <Button onClick={() => generateBookingReceipt(booking)} className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black uppercase text-xs gap-3 shadow-xl shadow-primary/20">
            <DollarSign size={18} /> Receipt PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* AI Intelligence Node */}
          <Card className={cn(
            "rounded-[2.5rem] border-primary/20 bg-primary/5 overflow-hidden shadow-xl border-dashed transition-all",
            booking.riskStatus === 'high' && "bg-red-500/5 border-red-500/20"
          )}>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-3">
                  <Sparkles size={16} /> Intelligence Node Insight
                </h3>
                <div className="flex gap-2">
                  <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase">{booking.aiPersonalityTag || 'Analyzed'}</Badge>
                  {booking.riskStatus && (
                    <Badge className={cn(
                      "text-white border-none text-[8px] font-black uppercase",
                      booking.riskStatus === 'low' ? "bg-emerald-500" : booking.riskStatus === 'medium' ? "bg-amber-500" : "bg-red-500"
                    )}>
                      Risk: {booking.riskStatus}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed italic opacity-80">
                "{booking.geminiInsight || "Initialize analysis to receive tactical handling advice for this expedition."}"
              </p>
              {booking.riskReason && (
                <div className="p-4 bg-red-500/10 rounded-xl flex gap-3 items-center">
                  <AlertTriangle className="text-red-500 h-4 w-4" />
                  <p className="text-[10px] font-bold text-red-500 uppercase">{booking.riskReason}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden">
             <div className="p-8 border-b border-border bg-muted/20">
                <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-3">
                  <ShieldCheck size={16} /> Operational Registry Detail
                </h3>
             </div>
             <CardContent className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Traveler Identity</p>
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">{booking.userName?.charAt(0)}</div>
                           <div>
                              <p className="text-sm font-black text-foreground uppercase">{booking.userName}</p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-1">{booking.userEmail} • {booking.userPhone}</p>
                           </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Detailed Pickup Node</p>
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                           <Truck size={14} className="text-primary" /> {booking.pickupLocation || 'Dar es Salaam Hub'}
                        </p>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Asset Allocation</p>
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"><Car size={24} /></div>
                           <div>
                              <p className="text-sm font-black text-foreground uppercase">{booking.vehicleName}</p>
                              <p className="text-[10px] text-primary font-black mt-1 uppercase tracking-widest font-mono">{booking.vehiclePlate}</p>
                           </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Accounting Logic (TSh)</p>
                        <div className="space-y-1">
                           <p className="text-2xl font-black text-foreground tracking-tighter">{booking.totalPrice?.toLocaleString()}</p>
                           <p className={cn(
                             "text-[10px] font-bold uppercase",
                             booking.paymentStatus === 'paid' ? "text-emerald-500" : "text-amber-500"
                           )}>
                             Settled: {(booking.amountPaid || 0).toLocaleString()}
                           </p>
                           <p className="text-[10px] font-bold text-red-500 uppercase">Balance: {((booking.totalPrice || 0) - (booking.amountPaid || 0)).toLocaleString()}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden">
             <div className="p-8 border-b border-border bg-muted/20">
                <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                  <DollarSign size={16} /> Financial & Resource Assignment
                </h3>
             </div>
             <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground">Assign Fleet Driver</Label>
                      <Select value={driverName} onValueChange={setDriverName}>
                         <SelectTrigger className="h-12 rounded-xl bg-muted border-none font-bold uppercase text-[10px]"><SelectValue placeholder="Select Registry Driver" /></SelectTrigger>
                         <SelectContent className="bg-card border-border">
                            {drivers.map(d => <SelectItem key={d.id} value={d.displayName} className="font-bold text-[10px] uppercase">{d.displayName}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground">Manual Payment Received (TSh)</Label>
                      <Input 
                        type="number" 
                        value={amountPaid} 
                        onChange={e => setAmountPaid(Number(e.target.value))} 
                        className="h-12 rounded-xl bg-muted border-none font-bold text-foreground" 
                        placeholder="e.g. 150000"
                      />
                      <p className="text-[8px] text-muted-foreground uppercase font-medium italic mt-1">"Use this to log cash or office settlements."</p>
                   </div>
                </div>
                <Button 
                  onClick={() => handleUpdateProtocol()} 
                  disabled={isUpdating}
                  className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 gap-3"
                >
                  {isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck size={18} />}
                  Commit Financial Protocol
                </Button>
             </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-border bg-muted/20">
                <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Workflow Status</h3>
             </div>
             <CardContent className="p-8 space-y-3">
               {['pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
                 <Button 
                   key={s} 
                   onClick={() => handleUpdateProtocol(s)} 
                   disabled={isUpdating}
                   className={cn(
                     "w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all", 
                     booking.status === s 
                      ? "bg-primary text-white border-primary" 
                      : "bg-muted border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
                   )}
                 >
                   {s}
                 </Button>
               ))}
             </CardContent>
          </Card>

          <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] flex gap-4 items-start shadow-inner">
             <AlertTriangle className="text-primary shrink-0" size={20} />
             <p className="text-[10px] text-blue-100/60 font-medium leading-relaxed italic">
                "Protocol Notice: Manual payments are logged in the financial ledger and synced with n8n accounting nodes instantly."
             </p>
          </div>

          <Card className="rounded-[2.5rem] border-border bg-card overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-border bg-muted/20">
              <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                <PenTool size={16} /> Digital Signatures (Dual Authorization)
              </h3>
            </div>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 border-r-0 md:border-r border-border md:pr-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Client Signature</h4>
                {booking.clientSignature ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-white border-2 border-dashed border-emerald-500/20 rounded-[1.5rem] p-4 flex justify-center shadow-inner">
                      <img src={booking.clientSignature} alt="Client Signature" className="h-20 object-contain" />
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 text-[10px] uppercase font-black tracking-widest w-full justify-center"><CheckCircle2 size={14} className="mr-2 inline" /> Client Bound</Badge>
                    <Button variant="outline" onClick={() => updateDoc(bookingRef, { clientSignature: null })} className="w-full mt-4 rounded-xl text-[10px] uppercase font-black text-red-500 border-red-500/20 hover:bg-red-500/5">Reset Client Sign</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[9px] text-muted-foreground uppercase font-medium italic text-center">"Client must sign here"</p>
                    <SignaturePad bookingId={booking.id} type="client" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Admin / Dispatch Signature</h4>
                {booking.adminSignature ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-white border-2 border-dashed border-emerald-500/20 rounded-[1.5rem] p-4 flex justify-center shadow-inner">
                      <img src={booking.adminSignature} alt="Admin Signature" className="h-20 object-contain" />
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-2 text-[10px] uppercase font-black tracking-widest w-full justify-center"><CheckCircle2 size={14} className="mr-2 inline" /> Admin Authorized</Badge>
                    <Button variant="outline" onClick={() => updateDoc(bookingRef, { adminSignature: null })} className="w-full mt-4 rounded-xl text-[10px] uppercase font-black text-red-500 border-red-500/20 hover:bg-red-500/5">Reset Admin Sign</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[9px] text-muted-foreground uppercase font-medium italic text-center">"Admin authorizes vehicle release"</p>
                    <SignaturePad bookingId={booking.id} type="admin" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}