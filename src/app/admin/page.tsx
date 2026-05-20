'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  onSnapshot,
} from 'firebase/firestore';
import { 
  CreditCard, 
  Car, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowRight,
  Zap,
  CalendarDays,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  User,
  Users,
  Star,
  Truck,
  ClipboardList,
  Plus,
  FileDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, startOfDay, startOfMonth, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { AdminIntelligenceNode } from '@/components/admin/admin-intelligence-node';
import { TodayOverview } from '@/components/admin/today-overview';
import { Skeleton } from '@/components/ui/skeleton';
import { convertToCSV } from '@/lib/export';

export default function AdminDashboard() {
  const db = useFirestore();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeRentals: 0,
    fleetSize: 0,
    customers: 0,
    avgRating: 4.8
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fleet Stats
    const unsubCars = onSnapshot(collection(db, 'cars'), (snap) => {
      setStats(prev => ({ 
        ...prev, 
        fleetSize: snap.size,
        avgRating: snap.docs.reduce((acc, d) => acc + (d.data().rating || 5), 0) / (snap.size || 1)
      }));
    });

    // 2. Booking Stats
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const docs = snap.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        totalBookings: snap.size,
        activeRentals: docs.filter(b => b.status === 'active').length,
        totalRevenue: docs.filter(b => b.paymentStatus === 'paid').reduce((acc, b) => acc + (b.totalPrice || 0), 0)
      }));
      
      // Activity Feed (Manual sort)
      const activityData = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
        .slice(0, 10);
      setActivities(activityData);
      setLoading(false);
    });

    // 3. Customer Stats
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'customer')), (snap) => {
      setStats(prev => ({ ...prev, customers: snap.size }));
    });

    return () => {
      unsubCars();
      unsubBookings();
      unsubUsers();
    };
  }, [db]);

  const statItems = [
    { title: "Total Revenue", val: `TSh ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', sub: "Verified settlements" },
    { title: 'Total Bookings', val: stats.totalBookings.toString(), icon: ClipboardList, color: 'text-blue-500', sub: "Historical registry" },
    { title: 'Active Rentals', val: stats.activeRentals.toString(), icon: Car, color: 'text-purple-500', sub: "Currently dispatched" },
    { title: 'Fleet Size', val: stats.fleetSize.toString(), icon: Truck, color: 'text-slate-400', sub: "Total asset units" },
    { title: 'Customers', val: stats.customers.toString(), icon: Users, color: 'text-orange-500', sub: "Elite traveler nodes" },
    { title: 'Avg Rating', val: `${stats.avgRating.toFixed(1)} ★`, icon: Star, color: 'text-amber-500', sub: "Client satisfaction" },
  ];

  const handleExport = () => {
    if (activities.length > 0) convertToCSV(activities, 'daily_audit');
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Operational Summary</h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">Global logistics and real-time fleet intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <AdminIntelligenceNode />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <TrendingUp size={150} className="text-primary" />
              </div>
              <div className="p-8 border-b border-border bg-white/5 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Financial Pulse</p>
                    <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">Cashflow Control</h3>
                 </div>
                 <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase px-3 py-1">Live Inflow</Badge>
                 </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                       <div>
                          <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest mb-1">Today's Revenue</p>
                          <p className="text-2xl font-black text-foreground">TSh {stats.totalRevenue.toLocaleString()}</p>
                       </div>
                       <Zap className="text-emerald-500 animate-pulse" size={20} />
                    </div>
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                       <div>
                          <p className="text-[8px] font-black uppercase text-primary tracking-widest mb-1">Monthly Volume</p>
                          <p className="text-xl font-black text-foreground">{stats.totalBookings} Orders</p>
                       </div>
                       <ClipboardList className="text-primary" size={20} />
                    </div>
                 </div>
                 <div className="flex flex-col justify-center space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-border pb-3">
                       <span className="text-muted-foreground">Active Missions</span>
                       <span className="text-foreground">{stats.activeRentals} / {stats.fleetSize} Units</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-border pb-3">
                       <span className="text-muted-foreground">Elite Travelers</span>
                       <span className="text-foreground">{stats.customers} Nodes</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase border-b border-border pb-3">
                       <span className="text-muted-foreground">Satisfied Tier</span>
                       <span className="text-emerald-500">{stats.avgRating.toFixed(1)} Rating</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <Card className="rounded-[2.5rem] bg-zinc-950 text-white border-none shadow-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform">
             <Zap size={180} className="text-primary" />
           </div>
           <div className="space-y-4 relative z-10">
              <Badge className="bg-white/10 text-white border-none uppercase text-[8px] font-black tracking-widest">Admin Hub</Badge>
              <h3 className="text-2xl font-black uppercase leading-tight tracking-tighter italic">Quick <br/>Dispatch Control</h3>
              <p className="text-white/40 text-[9px] font-medium leading-relaxed uppercase tracking-widest">Accelerate your administrative workflows with precision tools.</p>
           </div>
           <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
              <Link href="/admin/bookings/manual" className="col-span-2">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2">
                  <Plus size={14} /> Manual Booking
                </Button>
              </Link>
              <Link href="/admin/cars">
                <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 font-black uppercase text-[9px] tracking-widest rounded-xl">
                  Fleet
                </Button>
              </Link>
              <Link href="/admin/bookings">
                <Button variant="outline" className="w-full h-12 border-white/10 text-white hover:bg-white/5 font-black uppercase text-[9px] tracking-widest rounded-xl">
                  Registry
                </Button>
              </Link>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-card" />)
        ) : statItems.map((item, i) => (
          <Card key={i} className="bg-card border-border rounded-2xl group hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl bg-muted/50", item.color)}>
                  <item.icon size={18} />
                </div>
                <Badge variant="outline" className="text-[7px] font-black border-border text-muted-foreground px-1.5 py-0">LIVE</Badge>
              </div>
              <h3 className="text-lg font-black text-foreground tracking-tight truncate">{item.val}</h3>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">{item.title}</p>
              <p className="text-[7px] text-muted-foreground/40 font-bold uppercase mt-2">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SCHEDULE WIDGET */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
             <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
               <CalendarDays className="text-primary" /> Today's Expedition Schedule
             </h2>
             <TodayOverview />
          </div>

          <Card className="rounded-[2.5rem] border-primary/20 bg-primary/5 overflow-hidden shadow-xl border-dashed">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.4em] flex items-center gap-3">
                  <Sparkles size={18} /> Strategic Advisory Node
                </h3>
                <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-3 py-1">Gemini AI Active</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-card border border-border rounded-2xl space-y-3 shadow-sm hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-2 text-[9px] font-black text-secondary uppercase tracking-widest">
                    <TrendingUp size={14} /> Revenue Intelligence
                  </div>
                  <p className="text-xs font-bold text-foreground leading-relaxed italic">
                    "Fleet utilization is consistent. Recommend seasonal premium adjustments for Arusha safari category."
                  </p>
                </div>
                <div className="p-6 bg-card border border-border rounded-2xl space-y-3 shadow-sm hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                    <User size={14} /> Traveler Insights
                  </div>
                  <p className="text-xs font-bold text-foreground leading-relaxed italic">
                    "High volume of corporate bookings detected. Ensure VIP reception protocol is synced with the dispatch team."
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ACTIVITY FEED */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="text-primary" />
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Recent Activity</h3>
          </div>
          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden divide-y divide-border shadow-xl">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : activities.length === 0 ? (
              <div className="p-12 text-center text-[10px] font-black uppercase text-muted-foreground/30">Buffer Empty</div>
            ) : activities.map((act) => (
              <div key={act.id} className="p-5 flex items-start gap-4 hover:bg-muted transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-foreground leading-tight uppercase group-hover:text-primary transition-colors">
                    {act.bookingCode || 'REGISTRY'} Update
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1 truncate">
                    {act.userName} • {act.vehicleName}
                  </p>
                  <p className="text-[7px] text-muted-foreground/40 mt-1 uppercase font-black">
                    {act.updatedAt?.toDate ? format(act.updatedAt.toDate(), 'HH:mm') : 'Recently'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/bookings" className="block">
            <Button variant="ghost" className="w-full h-12 text-primary font-black uppercase text-[9px] tracking-[0.3em] gap-3">
              Full Registry Audit <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
