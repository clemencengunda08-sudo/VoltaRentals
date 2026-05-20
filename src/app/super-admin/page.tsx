'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import { 
  Car, 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Plus, 
  TrendingUp, 
  Cpu, 
  ShieldAlert,
  ArrowUpRight,
  Database,
  CheckCircle2,
  Settings,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRevenueStats } from '@/lib/analytics'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalBookings: 0,
    totalCustomers: 0,
    pendingPayments: 0,
  })
  const [revStats, setRevStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [carsSnap, bookingsSnap, usersSnap, paymentsSnap, rs] = 
          await Promise.all([
            getDocs(query(collection(db, 'cars'), limit(100))),
            getDocs(query(collection(db, 'bookings'), limit(100))),
            getDocs(query(collection(db, 'users'), where('role', '==', 'customer'), limit(100))),
            getDocs(query(collection(db, 'bookings'), where('paymentStatus', '==', 'pending'), limit(50))),
            getRevenueStats(db)
          ])

        setStats({
          totalCars: carsSnap.size,
          totalBookings: bookingsSnap.size,
          totalCustomers: usersSnap.size,
          pendingPayments: paymentsSnap.size,
        })
        setRevStats(rs)
        
        // Manual sort client-side from the limited pool
        const docs = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Manual sort client-side
        const sorted = docs.sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setRecentActivities(sorted.slice(0, 5));
        
      } catch (error) {
        console.error('Terminal stats error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, []);

  const statCards = [
    { label: 'Operational Fleet', value: stats.totalCars, icon: Car, color: 'text-primary' },
    { label: 'Active Reserves', value: stats.totalBookings, icon: Calendar, color: 'text-secondary' },
    { label: 'Elite Travelers', value: stats.totalCustomers, icon: Users, color: 'text-emerald-500' },
    { label: 'Unverified Settlements', value: stats.pendingPayments, icon: Clock, color: 'text-amber-500' },
  ]

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-secondary" /> Authority Level: Master Node (Super Admin)
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
            System <span className="text-primary italic">Command</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] italic">VoltaRentals Global Operational Hub.</p>
        </div>
        <div className="flex gap-4">
          <Link href='/super-admin/admins'>
            <Button variant="outline" className="h-16 px-10 border-border text-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3">
              <Users size={16} /> Staff Registry
            </Button>
          </Link>
          <Link href='/super-admin/fleet/new'>
            <Button className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3">
              <Plus size={16} /> Provision Asset
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[3rem] bg-card border-border shadow-3xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
             <TrendingUp size={200} className="text-primary" />
           </div>
           <CardHeader className="p-10 border-b border-border bg-white/5">
             <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-[0.4em] text-primary">Intelligence & Cashflow Hub</CardTitle>
                <div className="flex items-center gap-2">
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px] uppercase px-3 py-1">+{revStats?.monthOverMonthGrowth || 0}% Momentum</Badge>
                   <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] uppercase px-3 py-1">Velocity: {revStats?.transactionCount || 0} OP/30D</Badge>
                </div>
             </div>
           </CardHeader>
           <CardContent className="p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Global Gross Revenue</p>
                  <h3 className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter">TSh {revStats?.allTimeRevenue?.toLocaleString()}</h3>
                  <div className="flex items-center gap-2 mt-4">
                     <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: '65%' }} />
                     </div>
                     <span className="text-[9px] font-black text-primary uppercase">65% Target</span>
                  </div>
                </div>
                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest block">Today's Inflow</span>
                       <span className="text-2xl font-black text-foreground">TSh {revStats?.todayRevenue?.toLocaleString()}</span>
                    </div>
                    <Zap className="text-emerald-500 animate-pulse" size={24} />
                  </div>
                  <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="space-y-1">
                       <span className="text-[9px] font-black uppercase text-primary tracking-widest block">This Month Gross</span>
                       <span className="text-2xl font-black text-foreground">TSh {revStats?.thisMonthRevenue?.toLocaleString()}</span>
                    </div>
                    <TrendingUp className="text-primary" size={24} />
                  </div>
                </div>
              </div>
           </CardContent>
        </Card>

        <Card className="rounded-[3rem] bg-primary text-white border-none shadow-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform">
             <Cpu size={240} />
           </div>
           <div className="space-y-4">
              <Badge className="bg-white/20 text-white border-none uppercase text-[8px] font-black tracking-widest">Automation Node</Badge>
              <h3 className="text-3xl font-black uppercase leading-tight tracking-tighter">n8n Engine <br/>Status: Operational</h3>
              <p className="text-white/60 text-xs font-medium leading-relaxed italic">"Dispatching all registry events to the central automation hub in real-time."</p>
           </div>
           <Link href="/super-admin/settings?tab=automation" className="mt-10">
              <button className="w-full h-14 rounded-2xl bg-white text-primary font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3">
                <LinkIcon size={16} /> Configure Webhooks <ArrowUpRight size={16} />
              </button>
           </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-44 bg-card rounded-[2rem] border border-border animate-pulse" />)
        ) : statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-[2rem] p-10 group hover:border-primary/30 transition-all duration-500 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3.5 rounded-xl bg-muted/50", card.color)}>
                <card.icon size={24} />
              </div>
              <Badge variant="outline" className="text-[7px] font-black border-border text-muted-foreground px-2 py-0">LIVE SYNC</Badge>
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter mb-1">{card.value}</div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">{card.label}</div>
            
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12 pointer-events-none">
               <card.icon size={80} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                 <ShieldAlert className="text-primary" /> Security & Flow Audit
              </h2>
              <Link href="/super-admin/bookings" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Full Audit →</Link>
           </div>
           <div className="bg-card border border-border rounded-[3rem] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Asset</th>
                    <th className="px-8 py-6">Settlement</th>
                    <th className="px-8 py-6 text-right">Registry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentActivities.map(act => (
                    <tr key={act.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black uppercase text-foreground">{act.userName}</p>
                        <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase">{act.bookingCode}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-foreground/80 uppercase">{act.vehicleName}</p>
                      </td>
                      <td className="px-8 py-6 font-black text-emerald-500">TSh {act.totalPrice?.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <Badge className="bg-primary/10 text-primary text-[8px] font-black uppercase border-none">{act.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-8">
           <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Database className="text-primary" /> Master Logs
           </h2>
           <Card className="rounded-[2.5rem] bg-card border-border shadow-3xl p-8 space-y-6">
              {[
                { title: 'Core Registry Healthy', time: '1m ago', icon: <CheckCircle2 className='text-emerald-500' size={14} /> },
                { title: 'n8n Webhook Synced', time: '14m ago', icon: <Cpu className='text-primary' size={14} /> },
                { title: 'Security Protocol Check', time: '1h ago', icon: <ShieldCheck className='text-secondary' size={14} /> },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3">
                      {log.icon}
                      <span className="text-xs font-bold text-foreground/80 uppercase">{log.title}</span>
                   </div>
                   <span className="text-[8px] font-black text-muted-foreground uppercase">{log.time}</span>
                </div>
              ))}
              <Link href="/super-admin/settings">
                <Button variant="outline" className="w-full h-12 rounded-xl border-border font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted">
                  <Settings size={14} className="mr-2" /> System Configuration
                </Button>
              </Link>
           </Card>
        </div>
      </div>
    </div>
  )
}
