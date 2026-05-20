'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { FlickeringGrid } from '@/components/ui/flickering-footer';
import { useBranding } from '@/components/providers/BrandingProvider';
import { toast } from '@/hooks/use-toast';

const INACTIVITY_LIMIT = 90 * 1000; // 90 seconds protocol

// MASTER AUTHORITIES BYPASS
const SUPREME_MASTERS = [
  'clemencengunda08@gmail.com',
  'davidbyanmwijage@gmail.com',
  'mwijaydavie@gmail.com',
  'super_admin@voltarentals.com' // Testing Master Key Bypass
];

export default function SuperAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { companyName, mode } = useBranding();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [pinAuthorized, setPinAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbPin, setDbPin] = useState('8104');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'security'), (snap) => {
      if (snap.exists() && snap.data().pin) {
        setDbPin(snap.data().pin);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = "user-role=; path=/; max-age=0";
      document.cookie = "user-uid=; path=/; max-age=0";
      toast({ title: "Security Protocol", description: "Super Admin session timed out." });
      window.location.href = '/';
    } catch (e) {
      window.location.href = '/';
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => handleLogout(), INACTIVITY_LIMIT);
  };

  useEffect(() => {
    if (authorized) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(e => document.addEventListener(e, resetTimer));
      resetTimer();

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        events.forEach(e => document.removeEventListener(e, resetTimer));
      };
    }
  }, [authorized]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.replace('/auth');
          setChecking(false);
          return;
        }

        try {
          // SUPREME MASTER BYPASS
          const email = user.email?.toLowerCase() || '';
          if (SUPREME_MASTERS.map(m => m.toLowerCase()).includes(email)) {
            setAuthorized(true);
            setChecking(false);
            return;
          }

          const idTokenResult = await user.getIdTokenResult();
          const role = idTokenResult.claims.role as string;

          if (role === 'super_admin') {
            setAuthorized(true);
          } else if (role === 'admin' || role === 'staff') {
            router.replace('/admin');
          } else {
            router.replace('/dashboard');
          }
        } catch (error) {
          console.error('SuperAdmin Auth Error:', error);
          // If we fail to get token result, we still try to let them in if they are in the bypass list
          // but we already checked that. So we redirect to dashboard as a safe harbor.
          router.replace('/dashboard');
        } finally {
          setChecking(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#070D1A] flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary text-secondary flex items-center justify-center shadow-2xl animate-pulse">
            <Zap size={28} fill="currentColor" />
          </div>
          <div className="absolute -inset-3 rounded-3xl border-2 border-primary/5 animate-[spin_3s_linear_infinite]" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Verifying Authority Node</p>
      </div>
    );
  }

  if (!authorized) return null;

  if (!pinAuthorized) {
    return (
      <div className="min-h-screen bg-[#070D1A] flex flex-col items-center justify-center text-white">
        <div className="space-y-6 max-w-sm text-center px-4">
          <ShieldCheck className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-2xl font-black uppercase tracking-widest">Supreme Authority Node</h1>
          <p className="text-xs text-white/50 uppercase tracking-widest">Enter secondary security PIN to access global protocols.</p>
          <input 
            type="password" 
            autoFocus
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              if (e.target.value === dbPin) {
                setPinAuthorized(true);
              }
            }}
            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl font-black tracking-[1em] text-white outline-none focus:border-primary transition-all"
          />
          {pinInput.length === 4 && pinInput !== dbPin && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Access Denied</p>
          )}
        </div>
      </div>
    );
  }

  const gridBaseColor = mode === 'light' ? "#E2E8F0" : "#1A1A1A";

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body text-foreground">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto no-scrollbar bg-background">
          <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-64px-200px)]">
            {children}
          </div>

          <div className="w-full h-40 relative mt-20 border-t border-border overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background z-10" />
             <div className="absolute inset-0 px-6">
                <FlickeringGrid
                  text={companyName || "VOLTA RENTALS"}
                  fontSize={60}
                  className="h-full w-full"
                  squareSize={2}
                  gridGap={3}
                  color={gridBaseColor}
                  highlightColor="hsl(var(--primary))"
                  maxOpacity={mode === 'light' ? 0.3 : 0.2}
                  flickerChance={0.1}
                />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
