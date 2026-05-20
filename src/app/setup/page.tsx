'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2, CheckCircle2, Zap, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Executive Setup Terminal.
 * Initializes Super Admin authority and configures secure auth cookies.
 */
export default function SetupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handlePromote = async () => {
    if (!user) {
      router.push('/auth?redirect=/setup');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'System Admin',
        role: 'super_admin',
        verified: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Refresh unified cookies for middleware
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `user-role=super_admin; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `user-uid=${user.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;

      toast({ title: "Authority Granted! 🚀", description: "You are now a Super Admin." });
      window.location.href = '/super-admin';
    } catch (e: any) {
      toast({ variant: "destructive", title: "Setup Error", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full bg-card border-border shadow-3xl rounded-[2.5rem]">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <ShieldCheck size={32} className="text-secondary" />
          </div>
          <CardTitle className="text-white text-3xl font-black tracking-tight uppercase">Admin Master Key</CardTitle>
          <CardDescription className="text-muted-foreground">Initialize or repair your Super Admin status for the 2026 fleet.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {user ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <CheckCircle2 size={20} />
                <p className="font-bold text-sm">Auth Sync: {user.email}</p>
              </div>
              <Button 
                onClick={handlePromote} 
                disabled={isSubmitting}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-xl gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Zap size={16} fill="currentColor" />}
                Promote Current User to Super Admin
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-sm text-muted-foreground">You must be signed in to initialize the system.</p>
              <Button asChild className="w-full h-14 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl">
                <a href="/auth?redirect=/setup">Go to Login Terminal</a>
              </Button>
            </div>
          )}
        </CardContent>

        {user && (
          <CardFooter className="border-t border-border pt-6">
            <Button variant="ghost" onClick={() => signOut(auth)} className="w-full text-[10px] font-black uppercase text-white/20 hover:text-red-400">
              <LogOut className="mr-2 h-3 w-3" /> Use different identity
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
