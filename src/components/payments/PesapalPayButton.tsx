'use client';

import { useState } from 'react';
import { Loader2, Zap, SmartphoneNfc, MessageCircle, Clock, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PesapalPayButtonProps {
  bookingId: string;
  bookingCode: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  vehicleName: string;
}

// ── Fallback M-Pesa config — update in Super Admin Settings ──
const MPESA_NUMBER = '0700 000 000';
const ADMIN_WHATSAPP = '255700000000'; // Without +

export default function PesapalPayButton({
  bookingId,
  bookingCode,
  amount,
  customerEmail,
  customerPhone,
  customerName,
  vehicleName,
}: PesapalPayButtonProps) {
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [payLaterLoading, setPayLaterLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackSuggested, setFallbackSuggested] = useState(false);
  const [payLaterDone, setPayLaterDone] = useState(false);

  async function handlePay() {
    setLoading(true);
    setError('');
    setFallbackSuggested(false);

    try {
      // Simulate real-world delay for presentation (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update booking directly as Paid for the demo
      await updateDoc(doc(db, 'bookings', bookingId), {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentMethod: 'demo_pesapal',
        updatedAt: serverTimestamp(),
      });

      // Also create a payment record in the 'payments' collection so the Finance Terminal reflects it
      await addDoc(collection(db, 'payments'), {
        bookingId,
        bookingCode,
        amount: Number(amount),
        customerName,
        customerEmail,
        customerPhone,
        status: 'COMPLETED',
        paymentMethod: 'Pesapal (Demo)',
        createdAt: serverTimestamp(),
        reference: bookingCode,
        channel: 'Credit/Debit Card'
      });

      toast({ title: "✅ Payment Successful", description: "Simulated payment successfully." });
      
      // Reload to show the success state
      window.location.reload();
      return;
    } catch (e) {
      setError('Demo simulation failed.');
      setLoading(false);
      return;
    }
  }

  async function handlePayLater() {
    setPayLaterLoading(true);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        paymentStatus: 'manual_pending',
        paymentMethod: 'mpesa_manual',
        updatedAt: serverTimestamp(),
      });
      setPayLaterDone(true);
      toast({ title: "📋 Noted! Pay via M-Pesa", description: `Use ref ${bookingCode} when sending TSh ${amount.toLocaleString()}` });
    } catch {
      toast({ variant: "destructive", title: "Could not update booking" });
    } finally {
      setPayLaterLoading(false);
    }
  }

  const whatsappText = encodeURIComponent(
    `Hello Volta Rentals! I have made an M-Pesa payment.\n\nBooking: ${bookingCode}\nVehicle: ${vehicleName}\nAmount: TSh ${amount.toLocaleString()}\nName: ${customerName}\nPhone: ${customerPhone}\n\nPlease confirm my booking. Asante! 🙏`
  );

  if (payLaterDone) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[1.5rem] p-6 flex items-start gap-4">
          <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-emerald-500 font-black uppercase text-xs tracking-widest">Manual Payment Registered</p>
            <p className="text-muted-foreground text-xs mt-2">
              Send <strong className="text-foreground">TSh {amount.toLocaleString()}</strong> to M-Pesa number{' '}
              <strong className="text-foreground">{MPESA_NUMBER}</strong> using reference{' '}
              <strong className="text-primary font-mono">{bookingCode}</strong>. Our team will confirm within 2 hours.
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${ADMIN_WHATSAPP}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest py-4 px-6 rounded-[1.5rem] transition-all active:scale-95 shadow-xl"
        >
          <MessageCircle size={18} /> Notify Us via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-[1.5rem] px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <p className="text-destructive text-xs font-black uppercase tracking-tight">Gateway Issue</p>
              <p className="text-muted-foreground text-[11px] mt-1">{error}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-destructive/10">
            <button
              onClick={() => {
                setShowFallback(true);
              }}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 text-center font-bold"
            >
              Use Manual Payment Instead
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  await updateDoc(doc(db, 'bookings', bookingId), {
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    paymentMethod: 'demo_pesapal',
                    updatedAt: serverTimestamp(),
                  });
                  // Also create a payment record in the 'payments' collection so the Finance Terminal reflects it
                  await addDoc(collection(db, 'payments'), {
                    bookingId,
                    bookingCode,
                    amount: Number(amount),
                    customerName,
                    customerEmail,
                    customerPhone,
                    status: 'COMPLETED',
                    paymentMethod: 'Pesapal (Demo)',
                    createdAt: serverTimestamp(),
                    reference: bookingCode,
                    channel: 'Credit/Debit Card'
                  });
                  toast({ title: "✅ Demo Payment Successful", description: "Simulated payment successfully." });
                  window.location.reload();
                } catch (e) {
                  setError('Demo simulation failed');
                  setLoading(false);
                }
              }}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 text-center font-bold"
            >
              Simulate Demo Success
            </button>
          </div>
        </div>
      )}

      {/* ── Main Checkout Button ── */}
      <button
        onClick={handlePay}
        disabled={loading}
        className="group relative w-full bg-primary text-white font-black uppercase py-8 px-8 rounded-3xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_40px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_0_60px_-10px_rgba(220,38,38,0.7)] hover:scale-[1.02] active:scale-95 border-b-4 border-primary/50"
      >
        <div className="flex items-center justify-center gap-4">
          {loading ? (
            <Loader2 className="animate-spin h-8 w-8" />
          ) : (
            <Zap className="h-8 w-8 fill-secondary text-secondary animate-pulse" />
          )}
          <div className="flex flex-col items-center">
            <span className="text-xl tracking-widest">{loading ? 'Connecting to Gateway...' : 'COMPLETE PAYMENT'}</span>
            {!loading && <span className="text-xs text-secondary mt-1 font-bold tracking-widest uppercase">Total: TSh {Number(amount).toLocaleString()}</span>}
          </div>
        </div>
      </button>

      {/* ── Supported Channels ── */}
      <div className="bg-muted/50 border border-border rounded-[1.5rem] p-4 text-center">
        <p className="text-muted-foreground text-[9px] font-black tracking-[0.2em] uppercase mb-2">Supported Channels</p>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 opacity-60">
          <span className="text-[10px] font-black uppercase text-foreground">Vodacom M-Pesa</span>
          <span className="text-[10px] font-black uppercase text-foreground">Tigo Pesa</span>
          <span className="text-[10px] font-black uppercase text-foreground">Airtel Money</span>
          <span className="text-[10px] font-black uppercase text-foreground">VISA / Mastercard</span>
        </div>
      </div>

      {/* ── Manual Fallback Panel ── */}
      {showFallback && (
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-[1.5rem] p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <SmartphoneNfc className="text-amber-500" size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Manual M-Pesa Payment</p>
              <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Alternative payment — bypass online gateway</p>
            </div>
          </div>

          <div className="space-y-3 bg-background/50 rounded-xl p-4 border border-border">
            {[
              { label: "Send To", val: MPESA_NUMBER, highlight: true },
              { label: "Amount (TSh)", val: amount.toLocaleString(), highlight: true },
              { label: "Reference (IMPORTANT)", val: bookingCode, highlight: true, mono: true },
              { label: "Account Name", val: "Volta Rentals Tanzania" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-muted-foreground">{item.label}</span>
                <span className={cn(
                  "text-xs font-black",
                  item.highlight ? "text-primary" : "text-foreground",
                  item.mono && "font-mono tracking-widest"
                )}>
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg"
            >
              <MessageCircle size={14} /> Notify via WhatsApp
            </a>
            <button
              onClick={handlePayLater}
              disabled={payLaterLoading}
              className="flex items-center justify-center gap-2 bg-card hover:bg-muted border border-border text-foreground font-black uppercase text-[9px] tracking-widest py-3 px-4 rounded-xl transition-all active:scale-95"
            >
              {payLaterLoading ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
              Pay Later
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground text-center font-medium leading-relaxed italic">
            After sending payment, click "Notify via WhatsApp" — our team confirms within 2 hours.
          </p>
        </div>
      )}

      {/* ── Always-visible fallback toggle (not just on error) ── */}
      {!error && (
        <button
          onClick={() => setShowFallback(!showFallback)}
          className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground flex items-center justify-center gap-2 py-2 transition-colors"
        >
          {showFallback ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          {showFallback ? 'Hide' : 'Pay via M-Pesa Manually instead'}
        </button>
      )}
    </div>
  );
}
