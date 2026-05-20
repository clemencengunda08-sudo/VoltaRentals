'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { FlickeringGrid } from '@/components/ui/flickering-footer';
import { useBranding } from '@/components/providers/BrandingProvider';
import { Zap, Loader2, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DemoWidget } from '@/components/demo/DemoWidget';

const INACTIVITY_LIMIT = 180 * 1000; // 3 minutes for regular admins

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [roleLoading, setRoleLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const { companyName, mode } = useBranding();
  const db = useFirestore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async (silent = false) => {
    try {
      await signOut(auth);
      document.cookie = "user-role=; path=/; max-age=0";
      document.cookie = "user-uid=; path=/; max-age=0";
      if (!silent) {
        toast({ title: "Security Protocol", description: "Admin session terminated." });
      }
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
    if (user && !authLoading && !roleLoading) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(e => document.addEventListener(e, resetTimer));
      resetTimer();
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        events.forEach(e => document.removeEventListener(e, resetTimer));
      };
    }
  }, [user, authLoading, roleLoading]);

  useEffect(() => {
    async function checkRole() {
      if (authLoading) return;
      if (!user) {
        router.push('/auth');
        return;
      }
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.data();
        
        // ACCEPT admin, super_admin, company_admin, staff
        const allowedRoles = ['admin', 'super_admin', 'company_admin', 'staff'];
        if (!snap.exists() || !allowedRoles.includes(data?.role)) {
          router.push('/dashboard');
          return;
        }
        setRoleLoading(false);
      } catch (e) {
        setRoleLoading(false);
      }
    }
    checkRole();
  }, [user, authLoading, db, router]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl">
            <Zap className="text-secondary h-8 w-8 fill-current" />
          </div>
          <div className="absolute -inset-4 rounded-[2.5rem] border-2 border-primary/10 animate-[spin_3s_linear_infinite]" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Synchronizing Master Node</p>
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
          <div className="max-w-7xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-64px-200px)]">
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
      <DemoWidget />
    </div>
  );
}