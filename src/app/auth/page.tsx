'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter 
} from '@/components/ui/card';
import { auth, db } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { Zap, ArrowLeft, Loader2, Mail, Lock, Chrome, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notifyNewUser } from '@/lib/n8nWebhook';

// ITIFAKI YA MAMLAKA (MASTER REGISTRY)
const MASTER_SUPER_ADMINS = [
  'clemencengunda08@gmail.com', 
  'davidbyanmwijage@gmail.com',
  'super_admin@voltarentals.com' // Testing Master Key
];
const MASTER_ADMINS = [
  'mwijaydavie@gmail.com'
];

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRoleRedirect = (role: string, uid: string) => {
    const safeRole = role || 'customer';
    const maxAge = 60 * 60 * 24 * 7; 
    document.cookie = `user-role=${safeRole}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `user-uid=${uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
    
    setTimeout(() => {
      if (safeRole === 'super_admin') router.push('/super-admin');
      else if (['admin', 'company_admin', 'staff'].includes(safeRole)) router.push('/admin');
      else router.push('/dashboard');
    }, 800); 
  };

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) throw new Error("Auth failed");

      // Check against Firestore Whitelist first
      const configRef = doc(db, '_config', 'access_control');
      const configSnap = await getDoc(configRef);
      
      let assignedRole = 'customer';
      const userEmail = user.email ?? '';

      // Whitelist source
      if (configSnap.exists()) {
        const config = configSnap.data();
        if ((config.super_admins || []).includes(userEmail)) assignedRole = 'super_admin';
        else if ((config.admins || []).includes(userEmail)) assignedRole = 'admin';
      }

      // MASTER OVERRIDE (Hardcoded Safety)
      if (MASTER_SUPER_ADMINS.includes(userEmail)) assignedRole = 'super_admin';
      else if (MASTER_ADMINS.includes(userEmail)) assignedRole = 'admin';

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: assignedRole,
          verified: assignedRole !== 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newUser);
        notifyNewUser(newUser);
      } else {
        const existingRole = userSnap.data().role;
        // Upgrade only if assignedRole is higher than customer and differs from DB
        if (assignedRole !== 'customer' && existingRole !== assignedRole) {
          await updateDoc(userRef, { role: assignedRole, verified: true });
        } else {
          assignedRole = existingRole || assignedRole;
        }
      }

      handleRoleRedirect(assignedRole, user.uid);

    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-blocked') {
        toast({
          title: "Popup Blocked",
          description: "Re-routing to secure redirect mode...",
        });
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await import('firebase/auth').then(({ signInWithRedirect }) => signInWithRedirect(auth, provider));
        return;
      }
      toast({
        variant: "destructive",
        title: "Auth Protocol Error",
        description: "Google sync failed. Check Firebase config.",
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isSignUp) {
        res = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        res = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = res.user;
      let assignedRole = 'customer';

      // MASTER OVERRIDE
      if (MASTER_SUPER_ADMINS.includes(email)) assignedRole = 'super_admin';
      else if (MASTER_ADMINS.includes(email)) assignedRole = 'admin';

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          phoneNumber: phone,
          role: assignedRole,
          verified: assignedRole !== 'customer',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newUser);
        notifyNewUser(newUser);
      } else {
        assignedRole = userSnap.data().role || assignedRole;
      }

      handleRoleRedirect(assignedRole, user.uid);

    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Identity Denied", 
        description: "Credentials mismatch or registry error." 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm z-10 space-y-6">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-2 group">
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
          </Link>
          <div className="mx-auto h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl mb-4">
            <Zap className="text-white h-7 w-7 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Security <span className="text-primary italic">Terminal</span></h1>
        </div>

        <Card className="border-border bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-3xl">
          <CardContent className="p-6 md:p-8 space-y-6">
            <Button 
              onClick={handleGoogleLogin} 
              disabled={googleLoading}
              variant="outline" 
              className="w-full h-12 rounded-xl border-border bg-muted/50 text-foreground hover:bg-muted gap-4 font-bold text-[10px] uppercase tracking-widest"
            >
              {googleLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Chrome className="h-4 w-4 text-primary" />}
              Sync with Google Node
            </Button>
            
            <div className="flex items-center gap-4 py-1">
              <div className="h-px bg-border flex-1" />
              <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Email Path</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Email Node</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <Input
                    type="email"
                    placeholder="client@volta.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted border-none h-11 pl-12 rounded-xl font-bold text-sm text-foreground"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Phone ID</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                    <Input
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-muted border-none h-11 pl-12 rounded-xl font-bold text-sm text-foreground"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">Passcode</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted border-none h-11 pl-12 rounded-xl font-bold text-sm text-foreground"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-xl shadow-2xl mt-4 active:scale-95 transition-all text-[10px]"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : isSignUp ? 'Create Registry Node' : 'Enter Command Center'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-border bg-muted/20 py-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-[10px] font-black uppercase text-primary tracking-widest hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already a Member? Access' : "New Traveler? Join Registry"}
            </button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
