'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  where 
} from 'firebase/firestore';
import { 
  Search, 
  Eye, 
  XCircle, 
  CheckCircle2, 
  MoreVertical, 
  Car, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  User,
  ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { automation } from '@/lib/automation';

export default function AdminBookingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    let q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    if (activeTab !== 'all') {
      q = query(collection(db, 'bookings'), where('status', '==', activeTab), orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const loaded = snap.docs.map(doc => {
        const data = doc.data();
        // Auto-expire outdated pending orders
        if (data.status === 'pending' && data.endDate && new Date(data.endDate).getTime() < now) {
          updateDoc(doc.ref, { status: 'expired', updatedAt: serverTimestamp() }).catch(err => {});
          return { id: doc.id, ...data, status: 'expired' };
        }
        return { id: doc.id, ...data };
      });
      setBookings(loaded);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
    return () => unsub();
  }, [db, activeTab]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status, updatedAt: serverTimestamp() });
      automation.bookingStatusUpdated({ id, status });
      if (status === 'completed') automation.bookingCompleted({ id });
      toast({ title: `Order protocol set to ${status}` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const filteredBookings = bookings.filter(b => 
    (b.bookingCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      active: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-muted text-muted-foreground border-border',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-stone-100 text-stone-600 border-stone-200 font-mono'
    };
    return (
      <Badge className={cn("rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm", styles[status])}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Registry Console</h1>
        <p className="text-muted-foreground mt-2 font-medium">Logistical oversight for all current and historical reservations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="bg-muted border border-border p-1 rounded-2xl h-auto flex flex-wrap">
            {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired'].map(t => (
              <TabsTrigger 
                key={t} 
                value={t} 
                className="rounded-xl px-5 py-2.5 font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search code or customer name..." 
            className="h-12 pl-12 bg-card border-border text-foreground rounded-xl"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Registry ID</th>
                <th className="px-6 py-5">Customer Profile</th>
                <th className="px-6 py-5">Allocated Asset</th>
                <th className="px-6 py-5">Operational Window</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={6} className="px-6 py-10 animate-pulse"><div className="h-4 bg-muted rounded w-full" /></td></tr>)
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center space-y-4">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/20" />
                    <p className="text-muted-foreground italic font-black uppercase text-[10px] tracking-widest opacity-40">Registry Buffer Empty.</p>
                  </td>
                </tr>
              ) : filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-muted transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-primary font-mono tracking-tighter uppercase">{b.bookingCode}</span>
                    <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase">Logged: {b.createdAt?.toDate ? format(b.createdAt.toDate(), 'dd/MM/yy') : '...'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-foreground uppercase">{b.userName}</p>
                    <div className="flex items-center gap-2 mt-1.5 opacity-60">
                      <Clock size={10} className="text-primary" />
                      <span className="text-[9px] font-bold text-foreground uppercase tracking-widest">Client Rank: Elite</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-foreground/80 uppercase tracking-tighter">{b.vehicleName}</p>
                    <p className="text-[9px] text-muted-foreground mt-1.5 uppercase font-black">{b.vehiclePlate}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[10px] font-black text-foreground">{b.startDate ? format(new Date(b.startDate), 'dd MMM') : '...'}</p>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase">Pickup</p>
                      </div>
                      <ChevronRight size={12} className="text-primary opacity-30" />
                      <div>
                        <p className="text-[10px] font-black text-foreground">{b.endDate ? format(new Date(b.endDate), 'dd MMM') : '...'}</p>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase">Return</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-xl">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 bg-card border-border rounded-2xl p-2 shadow-2xl">
                        <DropdownMenuItem onClick={() => setSelectedBooking(b)} className="rounded-xl h-11 font-bold gap-3 cursor-pointer">
                          <Eye size={16} className="text-primary" /> Inspect Protocol
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(b.id, 'confirmed')} className="rounded-xl h-11 font-bold gap-3 text-emerald-600 cursor-pointer">
                          <ShieldCheck size={16} /> Confirm Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(b.id, 'active')} className="rounded-xl h-11 font-bold gap-3 text-primary cursor-pointer">
                          <Clock size={16} /> Mark As Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(b.id, 'completed')} className="rounded-xl h-11 font-bold gap-3 text-muted-foreground cursor-pointer">
                          <CheckCircle2 size={16} /> Protocol Complete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateStatus(b.id, 'cancelled')} className="rounded-xl h-11 font-bold gap-3 text-red-500 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                          <XCircle size={16} /> Abort Protocol
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="bg-card border-border rounded-[3rem] p-0 overflow-hidden max-w-2xl shadow-3xl">
          {selectedBooking && (
            <div className="flex flex-col">
              <div className="p-10 bg-primary/5 border-b border-border flex justify-between items-start">
                <div>
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest mb-3">Order Protocol Analysis</Badge>
                  <DialogTitle className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">{selectedBooking.bookingCode}</DialogTitle>
                  <p className="text-muted-foreground font-medium mt-3 flex items-center gap-2">
                    <User size={14} className="text-primary" /> {selectedBooking.userName} • {selectedBooking.userPhone}
                  </p>
                </div>
                <StatusBadge status={selectedBooking.status} />
              </div>
              
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Asset Configuration</h4>
                  <div className="p-6 bg-muted rounded-3xl border border-border space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Car size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground uppercase">{selectedBooking.vehicleName}</p>
                        <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-widest">{selectedBooking.vehiclePlate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Financial Node</h4>
                   <div className="p-6 bg-muted rounded-3xl border border-border space-y-4">
                      <p className="text-2xl font-black text-foreground">TSh {selectedBooking.totalPrice?.toLocaleString()}</p>
                      <Badge variant="outline" className="rounded-full px-3 text-[8px] font-black uppercase">{selectedBooking.paymentStatus}</Badge>
                   </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
