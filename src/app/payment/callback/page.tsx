'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type PayState = 'loading' | 'success' | 'failed' | 'pending';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderTrackingId = searchParams.get('OrderTrackingId') || '';

  const [state, setState] = useState<PayState>('loading');
  const [data, setData] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderTrackingId) {
      setState('failed');
      return;
    }
    verify();
  }, [orderTrackingId]);

  async function verify() {
    try {
      const res = await fetch('/api/payments/verify?orderTrackingId=' + orderTrackingId);
      const result = await res.json();
      setData(result);

      if (result.status === 'COMPLETED') {
        setState('success');
        setTimeout(() => router.push('/dashboard'), 4000);
      } else if (result.status === 'FAILED') {
        setState('failed');
      } else {
        setState('pending');
        // Try again for 5 times if still pending
        if (attempts < 5) {
          setTimeout(() => {
            setAttempts((a) => a + 1);
            verify();
          }, 5000);
        }
      }
    } catch {
      setState('failed');
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-[1.5rem] p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-6" />
          <h2 className="font-black tracking-tighter uppercase text-xl text-foreground mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground text-sm">Please wait. Synchronizing with Pesapal terminal.</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-[1.5rem] p-10 max-w-sm w-full text-center heavy-section">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="font-black tracking-tighter uppercase text-2xl text-foreground mb-2">Settlement Confirmed</h1>
          <p className="text-muted-foreground text-sm mb-6">Your expedition registry is now active.</p>

          {data?.amount && (
            <div className="bg-muted border border-border rounded-[1.5rem] p-4 mb-6">
              <p className="font-black tracking-tighter uppercase text-2xl text-accent">TSh {Number(data.amount).toLocaleString()}</p>
              {data.confirmationCode && <p className="text-muted-foreground text-[10px] font-black uppercase mt-1">Ref: {data.confirmationCode}</p>}
            </div>
          )}

          <p className="text-muted-foreground text-[10px] font-black uppercase mb-4 tracking-widest animate-pulse">Redirecting to Dashboard...</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-primary text-primary-foreground font-black tracking-tighter uppercase py-4 rounded-[1.5rem] hover:opacity-90 transition-opacity"
          >
            Access My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (state === 'pending') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-[1.5rem] p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="font-black tracking-tighter uppercase text-xl text-foreground mb-2">Processing Protocol</h2>
          <p className="text-muted-foreground text-sm mb-6">Waiting for bank confirmation... (Attempt {attempts + 1}/5)</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary text-[10px] font-black tracking-tighter uppercase hover:underline"
          >
            Check Manually in Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-[1.5rem] p-10 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="font-black tracking-tighter uppercase text-xl text-foreground mb-2">Protocol Aborted</h2>
        <p className="text-muted-foreground text-sm mb-6">Your payment could not be processed at this time.</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-muted text-foreground font-black tracking-tighter uppercase py-3 rounded-[1.5rem] text-[10px]"
          >
            Return
          </button>
          <a
            href="https://wa.me/255700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-primary text-primary-foreground font-black tracking-tighter uppercase py-3 rounded-[1.5rem] text-[10px] flex items-center justify-center shadow-lg"
          >
            Concierge Help
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center font-black tracking-tighter uppercase">
          Loading Registry...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
