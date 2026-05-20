'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  CalendarDays, 
  Search, 
  User, 
  Car, 
  Clock, 
  Receipt,
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadBookings() {
      const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    loadBookings();
  }, []);

  const filtered = bookings.filter(b => 
    `${b.bookingCode} ${b.userName} ${b.vehicleName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-2 border-b border-white/5 pb-10">
        <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none">Reservations</h1>
        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">Master registry of all active and historical expeditions</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by code, customer or asset..." 
            className="h-14 pl-12 rounded-2xl bg-card border-white/5 shadow-xl text-white font-bold"
          />
        </div>
        <div className="flex items-center gap-3 bg-card px-6 h-14 rounded-2xl border border-white/5">
           <Zap className="text-primary h-4 w-4 fill-current" />
           <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{bookings.length} Orders Logged</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-28 bg-card animate-pulse rounded-3xl border border-white/5" />)}
        </div>
      ) : (
        <div className="bg-card rounded-[3rem] border border-white/5 shadow-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Registry ID</th>
                  <th className="px-8 py-6">Traveler Profile</th>
                  <th className="px-8 py-6">Allocated Asset</th>
                  <th className="px-8 py-6">Investment</th>
                  <th className="px-8 py-6">Protocol Status</th>
                  <th className="px-8 py-6 text-right">Node</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-32 text-center text-white/20 italic font-black uppercase text-[10px]">Zero reservation logs found.</td></tr>
                ) : filtered.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-primary font-mono tracking-tighter uppercase">{b.bookingCode}</span>
                      <p className="text-[8px] font-black text-white/20 mt-1 uppercase tracking-widest">{b.createdAt ? format(b.createdAt.toDate(), "dd/MM/yy") : 'Pending'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white uppercase">{b.userName}</p>
                      <p className="text-[10px] font-bold text-white/40 mt-1 tracking-widest">{b.userPhone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-white/80 uppercase tracking-widest">{b.vehicleName}</p>
                      <p className="text-[9px] font-black text-primary uppercase mt-1 tracking-widest">{b.vehiclePlate}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-white">TSh {b.totalPrice?.toLocaleString()}</p>
                      <Badge variant="outline" className={cn(
                        "mt-1.5 text-[7px] font-black uppercase border-none px-2 h-4",
                        b.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-widest border-none shadow-lg",
                        b.status === 'confirmed' ? "bg-emerald-500/20 text-emerald-500" : 
                        b.status === 'pending' ? "bg-amber-500/20 text-amber-500" : "bg-primary/20 text-primary"
                      )}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button variant="ghost" size="icon" className="rounded-xl text-white/20 hover:text-white transition-all">
                        <ChevronRight size={18} />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
