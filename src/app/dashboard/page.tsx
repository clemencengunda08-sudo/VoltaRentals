'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { 
  CalendarDays, Car, Clock, ChevronRight, Zap, ShieldCheck, 
  TrendingUp, Receipt, ArrowUpRight, Award, Star, Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nidaInput, setNidaInput] = useState('');
  const [verifyingNida, setVerifyingNida] = useState(false);

  const handleVerifyNida = async () => {
    if (nidaInput.length < 10) {
      toast({ variant: 'destructive', title: 'Invalid NIDA', description: 'Please enter a valid National ID Number.' });
      return;
    }
    setVerifyingNida(true);
    // Simulate NIDA API verification delay
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', user!.uid), {
          nidaNumber: nidaInput,
          nidaStatus: 'verified'
        });
        toast({ title: 'Identity Verified ✅', description: 'Your NIDA profile is now linked to your Volta Registry.' });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Verification Failed', description: 'Could not update your profile.' });
      } finally {
        setVerifyingNida(false);
      }
    }, 2000);
  };

  /**
   * Safe Date Formatting Protocol.
   */
  const safeFormatDate = (dateVal: any, pattern: string = "dd MMM yyyy") => {
    if (!dateVal) return '...';
    try {
      const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(dateObj.getTime())) return '...';
      return format(dateObj, pattern);
    } catch (e) {
      return '...';
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen to profile for points
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data());
    });

    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsubBookings = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // CLIENT-SIDE SORTING for index resilience
      const sorted = docs.sort((a: any, b: any) => {
        const dateA = a.updatedAt?.toDate?.() || (a.updatedAt ? new Date(a.updatedAt) : new Date(0));
        const dateB = b.updatedAt?.toDate?.() || (b.updatedAt ? new Date(b.updatedAt) : new Date(0));
        return (dateB as any) - (dateA as any);
      });

      setHistory(sorted);
      const active = sorted.find((b: any) => ['confirmed', 'active', 'pending'].includes(b.status));
      setActiveBooking(active || null);
      setLoading(false);
    });

    return () => { unsubProfile(); unsubBookings(); };
  }, [db, user]);

  const loyalty = useMemo(() => {
    const pts = profile?.voltaPoints || 0;
    let tier = "Bronze";
    let icon = <Award size={18} />;
    let nextTier = "Silver";
    let nextLimit = 500;
    
    if (pts >= 5000) { tier = "Elite"; icon = <Gem size={18} className="text-primary" />; nextTier = "Max"; nextLimit = 5000; }
    else if (pts >= 2000) { tier = "Gold"; icon = <Star size={18} className="text-secondary" />; nextTier = "Elite"; nextLimit = 5000; }
    else if (pts >= 500) { tier = "Silver"; icon = <Award size={18} className="text-blue-400" />; nextTier = "Gold"; nextLimit = 2000; }

    const progress = Math.min(100, (pts / nextLimit) * 100);

    return { pts, tier, icon, nextTier, nextLimit, progress, value: pts * 100 };
  }, [profile]);

  const firstName = user?.displayName?.split(' ')[0] || 'Client';

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-[1.5rem]" />)}
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      {/* SECTION 1 - HEADER */}
      <AnimatedSection direction="down" delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Hello, <span className="text-primary">{firstName}!</span>
            </h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
          <Link href="/fleet">
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl gap-2">
              Reserve Asset <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>
      </AnimatedSection>

      {/* SECTION 2 - LOYALTY & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 executive-card p-10 bg-primary/5 border-primary/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Zap size={140} className="text-primary" /></div>
           <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl">{loyalty.icon}</div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-primary tracking-widest">{loyalty.tier} Protocol Status</p>
                       <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Volta Loyalty Registry</h3>
                    </div>
                 </div>
                 <Badge className="bg-primary text-white border-none uppercase text-[8px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-2xl">
                    ⚡ {loyalty.pts} VoltaPoints
                 </Badge>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground">
                    <span>Expedition Progress: {loyalty.pts} / {loyalty.nextLimit}</span>
                    <span>Next Rank: {loyalty.nextTier}</span>
                 </div>
                 <Progress value={loyalty.progress} className="h-2 rounded-full" />
                 <p className="text-[10px] text-muted-foreground font-medium italic">
                    "Your balance is worth <span className="text-primary font-black">TSh {loyalty.value.toLocaleString()}</span> in rental credits."
                 </p>
              </div>
           </div>
        </Card>

        <div className="space-y-6">
           <div className="executive-card p-8 flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
              <div>
                 <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Investment</p>
                 <h4 className="text-xl font-black text-foreground">TSh {(profile?.totalSpent || 0).toLocaleString()}</h4>
              </div>
           </div>
           <div className="executive-card p-8 flex items-center gap-6 group hover:border-primary/30 transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform"><Car size={24} /></div>
              <div>
                 <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Elite Missions</p>
                 <h4 className="text-xl font-black text-foreground">{history.length} Completed</h4>
              </div>
           </div>
        </div>
      </div>

      {/* NIDA VERIFICATION SECTION */}
      <div className="space-y-6">
        <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
          <ShieldCheck className="text-primary" /> Identity Registry (NIDA)
        </h2>
        <div className="executive-card p-10 bg-muted/20 border-dashed">
          {profile?.nidaStatus === 'verified' ? (
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={28} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase text-foreground">Verified Citizen</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">NIDA ID: {profile.nidaNumber}</p>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white uppercase text-[9px] font-black tracking-widest px-4 py-2 border-none">Authorized for Elite Fleet</Badge>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm font-medium italic text-muted-foreground">
                "Please verify your National ID (NIDA) to unlock access to premium fleet assets without an initial damage deposit."
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4 max-w-xl">
                <Input 
                  value={nidaInput} 
                  onChange={(e) => setNidaInput(e.target.value)}
                  placeholder="Enter 20-digit NIDA Number" 
                  className="h-14 rounded-xl font-bold bg-background text-foreground tracking-widest"
                />
                <Button 
                  onClick={handleVerifyNida}
                  disabled={verifyingNida}
                  className="h-14 px-8 w-full md:w-auto bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg gap-2 shrink-0"
                >
                  {verifyingNida ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify Identity'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3 - ACTIVE BOOKING */}
      <div className="space-y-6">
        <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
          <Zap className="text-primary" /> Active Protocol
        </h2>
        {activeBooking ? (
          <div className="executive-card p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative h-24 w-32 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
               {activeBooking.vehicleImage ? (
                 <Image src={activeBooking.vehicleImage} alt="Car" fill className="object-cover" unoptimized />
               ) : (
                 <div className="flex items-center justify-center h-full text-2xl">🚗</div>
               )}
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{activeBooking.vehicleName}</h3>
                <Badge variant="outline" className="mt-2 bg-muted border-border font-mono text-[10px] px-3">{activeBooking.bookingCode}</Badge>
              </div>
              <div className="text-2xl font-black text-primary tracking-tighter uppercase">
                {activeBooking.status === 'confirmed' ? (
                  <>PICKUP IN {Math.max(0, differenceInDays(new Date(activeBooking.startDate), new Date()))} DAYS</>
                ) : `STATUS: ${activeBooking.status}`}
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Return: {safeFormatDate(activeBooking.endDate)}
              </p>
            </div>
            <Button asChild className="bg-white text-black font-black uppercase text-[10px] tracking-widest px-10 h-14 rounded-xl shadow-xl hover:bg-primary hover:text-white transition-all">
              <Link href={`/dashboard/bookings/${activeBooking.id}`}>Manage Order</Link>
            </Button>
          </div>
        ) : (
          <div className="executive-card py-24 text-center border-dashed space-y-8">
            <span className="text-6xl grayscale opacity-20 block">🚗</span>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">No Active Reserve</h3>
              <p className="text-muted-foreground mt-2 text-sm italic">"Your current logistical registry is empty."</p>
            </div>
            <Link href="/fleet" className="inline-block">
              <Button className="h-14 px-10 bg-primary font-black uppercase text-[10px] tracking-widest rounded-xl shadow-2xl">Browse Registry →</Button>
            </Link>
          </div>
        )}
      </div>

      {/* SECTION 4 - HISTORY */}
      <div className="space-y-8">
        <h2 className="text-xl font-black tracking-tighter uppercase">Expedition History</h2>
        <StaggerContainer className="space-y-4" staggerDelay={0.08} delayChildren={0.3}>
          {history.length === 0 ? (
            <p className="text-center py-20 text-muted-foreground font-black uppercase text-[10px] tracking-[0.5em] italic opacity-20">Zero historical entries.</p>
          ) : history.map((b) => (
            <StaggerItem key={b.id}>
              <motion.div 
                whileHover={{ x: 4, borderColor: "hsl(var(--primary) / 0.4)", transition: { duration: 0.2 } }}
                className="executive-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all"
              >
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-black text-lg uppercase tracking-tight">{b.vehicleName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">{safeFormatDate(b.startDate, "dd MMM")} — {safeFormatDate(b.endDate, "dd MMM yyyy")}</p>
                </div>
                <Badge variant="outline" className="bg-muted border-border font-mono text-[10px]">{b.bookingCode}</Badge>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-black text-primary">TSh {b.totalPrice?.toLocaleString()}</p>
                    <Badge className={cn(
                      "mt-1 text-[8px] font-black uppercase px-3 border-none",
                      b.status === 'confirmed' ? "bg-accent/10 text-accent" : 
                      b.status === 'pending' ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                    )}>
                      {b.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.status === 'completed' && (
                      <Link href={`/dashboard/bookings/${b.id}/review`}>
                        <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-transparent text-[8px] font-black uppercase tracking-widest gap-1 shrink-0">
                          <Star size={10} className="fill-current" /> Feedback
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/bookings/${b.id}`}>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all"><ChevronRight size={18} /></Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
