'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  CalendarDays, 
  Car, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";

export default function BookingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date descending
      const sorted = docs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setBookings(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, [db, user]);

  const filteredBookings = bookings.filter(b => 
    (b.bookingCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.vehicleName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-10 pb-24">
      <AnimatedSection direction="down">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Expedition <span className="text-primary">Registry</span>
            </h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">
              Full logistical history of your vehicle assets
            </p>
          </div>
          <Link href="/fleet">
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl">
              New Reserve →
            </Button>
          </Link>
        </div>
      </AnimatedSection>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filter by code or vehicle..." 
            className="h-12 pl-12 bg-card border-border text-foreground rounded-xl"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-border bg-card font-black uppercase text-[9px] tracking-widest gap-2">
           <Filter size={14} /> Filter
        </Button>
      </div>

      <StaggerContainer className="space-y-6" staggerDelay={0.05}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))
        ) : filteredBookings.length === 0 ? (
          <div className="py-32 text-center space-y-4 opacity-30">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.4em] italic">No logistical entries found.</p>
          </div>
        ) : filteredBookings.map((b) => (
          <StaggerItem key={b.id}>
            <Link href={`/dashboard/bookings/${b.id}`}>
              <motion.div 
                whileHover={{ x: 8, borderColor: "hsl(var(--primary) / 0.4)" }}
                className="executive-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                      <Car size={32} />
                   </div>
                   <div>
                      <p className="font-black text-xl uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{b.vehicleName}</p>
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                         <Badge variant="outline" className="bg-muted border-border font-mono text-[9px] px-2">{b.bookingCode}</Badge>
                         <span className="text-[10px] font-bold uppercase tracking-widest">{safeFormatDate(b.startDate, "dd MMM")} — {safeFormatDate(b.endDate, "dd MMM yyyy")}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Fee</p>
                      <p className="text-xl font-black text-foreground">TSh {b.totalPrice?.toLocaleString()}</p>
                   </div>
                   
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <Badge className={cn(
                           "text-[9px] font-black uppercase px-4 py-1.5 border-none shadow-sm",
                           b.status === 'confirmed' ? "bg-emerald-500 text-white" : 
                           b.status === 'pending' ? "bg-amber-500 text-white" : 
                           b.status === 'active' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                         )}>
                           {b.status}
                         </Badge>
                         <p className="text-[8px] font-black text-muted-foreground/60 uppercase mt-1.5 text-right tracking-tighter">
                            {b.paymentStatus === 'paid' ? '✔ Settlement Complete' : '⌚ Settlement Pending'}
                         </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                         <ChevronRight size={20} />
                      </div>
                   </div>
                </div>
              </motion.div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
