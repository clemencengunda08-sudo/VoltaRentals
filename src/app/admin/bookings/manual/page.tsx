'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, doc, setDoc, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useCollection, useMemoFirebase } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { 
  UserPlus, Car, CalendarIcon, Save, CheckCircle2, Loader2, 
  ArrowLeft, Phone, Mail, MapPin, Banknote, Zap, Receipt
} from 'lucide-react';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { automation } from '@/lib/automation';
import { pdfService } from '@/lib/pdf-service';

type FormState = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  withDriver: boolean;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
};

const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank Transfer', 'Card', 'Other'];

export default function ManualBookingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [form, setForm] = useState<FormState>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleId: '',
    startDate: addDays(new Date(), 1),
    endDate: addDays(new Date(), 2),
    pickupLocation: 'Dar es Salaam',
    withDriver: false,
    paymentMethod: 'Cash',
    paymentStatus: 'paid',
    notes: '',
  });

  const carsQuery = useMemoFirebase(() =>
    query(collection(db, 'cars'), where('available', '==', true), limit(50)), [db]
  );
  const { data: cars, loading: carsLoading } = useCollection(carsQuery);
  const selectedCar = cars?.find(c => c.id === form.vehicleId);

  // Auto-correct end date if start date moves ahead
  useEffect(() => {
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setForm(p => ({ ...p, endDate: addDays(form.startDate, 1) }));
    }
  }, [form.startDate, form.endDate]);

  const pricing = useMemo(() => {
    if (!selectedCar) return null;
    const days = Math.max(1, differenceInCalendarDays(form.endDate, form.startDate) + 1);
    const base = selectedCar.pricePerDay * days;
    const driver = form.withDriver ? (selectedCar.withDriverCostPerDay || 50000) * days : 0;
    return { days, base, driver, total: base + driver };
  }, [selectedCar, form]);

  const set = (key: keyof FormState, val: any) => setForm(p => ({ ...p, [key]: val }));

  async function handleSubmit() {
    if (!form.customerName || !form.customerPhone || !selectedCar || !pricing) {
      toast({ variant: 'destructive', title: 'Fill all required fields' });
      return;
    }
    setSubmitting(true);
    try {
      // Double Booking Shield Check: Retrieve bookings for this vehicle and filter cancelled in-memory
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('vehicleId', '==', form.vehicleId)
      );
      const bookingsSnap = await getDocs(bookingsQuery);
      
      const newStart = form.startDate.getTime();
      const newEnd = form.endDate.getTime();

      let overlapFound = false;
      let overlappingBooking: any = null;

      bookingsSnap.docs.forEach((docSnap) => {
        const b = docSnap.data();
        if (b.status === 'cancelled') return;

        // Parse existing booking dates
        const existStart = new Date(b.startDate).getTime();
        const existEnd = new Date(b.endDate).getTime();

        // Check date overlap
        if (newStart <= existEnd && newEnd >= existStart) {
          overlapFound = true;
          overlappingBooking = b;
        }
      });

      if (overlapFound && overlappingBooking) {
        const formattedStart = format(new Date(overlappingBooking.startDate), 'dd MMM yyyy');
        const formattedEnd = format(new Date(overlappingBooking.endDate), 'dd MMM yyyy');
        toast({
          variant: 'destructive',
          title: '🚨 Scheduling Conflict',
          description: `This vehicle is already booked from ${formattedStart} to ${formattedEnd} (Code: ${overlappingBooking.bookingCode}). Please choose different dates or another vehicle.`,
        });
        setSubmitting(false);
        return;
      }

      const ref = doc(collection(db, 'bookings'));
      const bookingCode = `VOLTA-${ref.id.slice(-6).toUpperCase()}`;
      const data = {
        id: ref.id,
        bookingCode,
        source: 'manual_admin',
        userId: 'admin_manual',
        userName: form.customerName,
        userEmail: form.customerEmail || '',
        userPhone: form.customerPhone,
        vehicleId: form.vehicleId,
        vehicleName: `${selectedCar.make} ${selectedCar.model}`,
        vehiclePlate: selectedCar.plateNumber || '',
        pricePerDay: selectedCar.pricePerDay,
        totalDays: pricing.days,
        baseRate: pricing.base,
        driverFee: pricing.driver,
        airportFee: 0,
        totalPrice: pricing.total,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
        pickupLocation: form.pickupLocation,
        pickupTime: '09:00 AM',
        withDriver: form.withDriver,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        amountPaid: form.paymentStatus === 'paid' ? pricing.total : 0,
        status: form.paymentStatus === 'paid' ? 'confirmed' : 'pending',
        notes: form.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, data);

      if (form.paymentStatus === 'paid') {
        const paymentRef = doc(collection(db, 'payments'));
        await setDoc(paymentRef, {
          id: paymentRef.id,
          bookingId: ref.id,
          bookingCode: bookingCode,
          userId: 'admin_manual',
          amount: pricing.total,
          currency: 'TZS',
          paymentMethod: form.paymentMethod,
          source: 'manual',
          status: 'completed',
          confirmationCode: `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: serverTimestamp()
        });
      }

      // Trigger n8n webhook
      await automation.newBooking({
        ...data,
        userEmail: form.customerEmail,
        companyId: 'volta001',
      });

      setDone(data);
      toast({ title: `✅ Manual booking created: ${bookingCode}` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to create booking', description: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6">
        <Card className="rounded-[2.5rem] border-none shadow-3xl overflow-hidden">
          <div className="bg-primary p-10 text-center text-white">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Booking Created</h2>
            <p className="text-white/70 mt-2 font-mono text-lg tracking-widest">{done.bookingCode}</p>
          </div>
          <CardContent className="p-8 space-y-4">
            {[
              { l: 'Customer', v: done.userName },
              { l: 'Phone', v: done.userPhone },
              { l: 'Vehicle', v: done.vehicleName },
              { l: 'Duration', v: `${done.totalDays} Day(s)` },
              { l: 'Total', v: `TSh ${done.totalPrice?.toLocaleString()}` },
              { l: 'Payment', v: `${done.paymentMethod} — ${done.paymentStatus}` },
              { l: 'Status', v: done.status },
            ].map(item => (
              <div key={item.l} className="flex justify-between border-b border-border pb-2">
                <span className="text-[9px] font-black uppercase text-muted-foreground">{item.l}</span>
                <span className="text-xs font-black text-foreground uppercase">{item.v}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => pdfService.generateReceipt(done)}
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border-primary text-primary hover:bg-primary hover:text-white transition-all gap-2"
              >
                <Receipt size={14} /> Download Receipt
              </Button>
              <Button asChild variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase text-[10px]">
                <Link href="/admin/bookings">View All</Link>
              </Button>
            </div>
            <Button 
              onClick={() => { setDone(null); setForm({ customerName: '', customerPhone: '', customerEmail: '', vehicleId: '', startDate: addDays(new Date(), 1), endDate: addDays(new Date(), 2), pickupLocation: 'Dar es Salaam', withDriver: false, paymentMethod: 'Cash', paymentStatus: 'paid', notes: '' }); }} 
              className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase text-[10px] mt-2"
            >
              Create Another Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} /> Back to Bookings
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
            <UserPlus size={12} /> Walk-in / Manual Entry
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
            Manual <span className="text-primary italic">Booking</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">
            Create a booking directly for walk-in customers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">

          {/* Customer Info */}
          <Card className="rounded-[2rem] border-border bg-card p-8 shadow-xl space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">1</Badge>
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Full Name *</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                  <Input value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="e.g. Amina Mwangi" className="h-14 pl-11 rounded-xl bg-muted border-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                  <Input value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} placeholder="+255..." className="h-14 pl-11 rounded-xl bg-muted border-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Email (optional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                  <Input value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} placeholder="customer@email.com" className="h-14 pl-11 rounded-xl bg-muted border-none font-bold" />
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle & Dates */}
          <Card className="rounded-[2rem] border-border bg-card p-8 shadow-xl space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">2</Badge>
              Vehicle & Dates
            </h3>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Select Vehicle *</label>
              <Select onValueChange={v => set('vehicleId', v)} value={form.vehicleId}>
                <SelectTrigger className="h-14 rounded-xl bg-muted border-none font-bold uppercase text-[11px]">
                  <Car className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue placeholder="Choose from available fleet" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {carsLoading ? (
                    <div className="p-4 text-center text-xs animate-pulse font-bold">Loading fleet...</div>
                  ) : cars?.map(v => (
                    <SelectItem key={v.id} value={v.id} className="font-bold text-[11px] uppercase">
                      {v.make} {v.model} — TSh {v.pricePerDay?.toLocaleString()}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Start Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-14 w-full justify-start text-left font-bold bg-muted border-none rounded-xl px-5")}>
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      {format(form.startDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.startDate} onSelect={d => d && set('startDate', d)} disabled={d => d < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">End Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-14 w-full justify-start text-left font-bold bg-muted border-none rounded-xl px-5")}>
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      {format(form.endDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.endDate} onSelect={d => d && set('endDate', d)} disabled={d => d <= form.startDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Pickup Location</label>
              <Select onValueChange={v => set('pickupLocation', v)} value={form.pickupLocation}>
                <SelectTrigger className="h-14 rounded-xl bg-muted border-none font-bold uppercase text-[11px] pl-11 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 h-4 w-4" />
                  <SelectValue placeholder="Select District / Area" />
                </SelectTrigger>
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
            </div>

            <div className="p-5 bg-muted/40 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase">With Chauffeur</p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">+TSh 50,000 / Day</p>
              </div>
              <Switch checked={form.withDriver} onCheckedChange={v => set('withDriver', v)} />
            </div>
          </Card>

          {/* Payment */}
          <Card className="rounded-[2rem] border-border bg-card p-8 shadow-xl space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-white text-[10px]">3</Badge>
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Payment Method</label>
                <Select onValueChange={v => set('paymentMethod', v)} value={form.paymentMethod}>
                  <SelectTrigger className="h-14 rounded-xl bg-muted border-none font-bold uppercase text-[11px]">
                    <Banknote className="mr-2 h-4 w-4 text-primary" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m} value={m} className="font-bold text-[11px] uppercase">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Payment Status</label>
                <div className="flex gap-2">
                  {['paid', 'unpaid', 'partial'].map(s => (
                    <button
                      key={s}
                      onClick={() => set('paymentStatus', s)}
                      className={`flex-1 h-14 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                        form.paymentStatus === s
                          ? s === 'paid' ? 'bg-emerald-500 text-white' : s === 'unpaid' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Admin Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="e.g. Customer paid cash at office. Receipt #1234..."
                className="w-full bg-muted border-none rounded-xl p-4 min-h-[80px] text-sm focus:ring-1 focus:ring-primary outline-none font-medium resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] bg-card border-none shadow-3xl overflow-hidden sticky top-28">
            <div className="bg-primary p-8 text-center text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Total Amount</p>
              <h4 className="text-4xl font-black tracking-tighter mt-2">
                TSh {pricing?.total.toLocaleString() || '0'}
              </h4>
              {pricing && (
                <Badge variant="outline" className="mt-3 bg-white/10 border-white/20 text-white font-black uppercase text-[8px] px-3">
                  {pricing.days} Day(s) × TSh {selectedCar?.pricePerDay?.toLocaleString()}
                </Badge>
              )}
            </div>
            <CardContent className="p-8 space-y-5">
              {pricing && (
                <div className="space-y-3">
                  {[
                    { l: 'Base Rental', v: `TSh ${pricing.base.toLocaleString()}` },
                    ...(pricing.driver > 0 ? [{ l: 'Driver Fee', v: `TSh ${pricing.driver.toLocaleString()}` }] : []),
                    { l: 'Payment Method', v: form.paymentMethod },
                    { l: 'Status', v: form.paymentStatus.toUpperCase() },
                  ].map(item => (
                    <div key={item.l} className="flex justify-between text-[11px] font-black uppercase border-b border-border pb-2">
                      <span className="text-muted-foreground">{item.l}</span>
                      <span>{item.v}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.customerName || !form.customerPhone || !form.vehicleId}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl gap-3"
              >
                {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap size={18} fill="currentColor" />}
                Create Booking
              </Button>
              <p className="text-[9px] text-muted-foreground text-center font-medium leading-relaxed italic">
                Booking is saved to Firestore and n8n automation is triggered automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
