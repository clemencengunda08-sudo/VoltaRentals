'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Search, 
  Calendar,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { convertToCSV } from '@/lib/export';
import { toast } from '@/hooks/use-toast';

export default function PaymentsAudit() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  const stats = {
    total: payments.reduce((acc, p) => acc + (p.amount || 0), 0),
    count: payments.length,
    today: payments.filter(p => {
      const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
      return format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    }).length,
    thisMonth: payments.reduce((acc, p) => {
        const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
        if (isAfter(d, startOfMonth(new Date()))) return acc + (p.amount || 0);
        return acc;
    }, 0)
  };

  const filtered = payments.filter(p => 
    `${p.confirmationCode} ${p.paymentMethod} ${p.bookingCode}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (payments.length === 0) return;
    convertToCSV(payments, 'finance_audit');
    toast({ title: "Audit Exported", description: "CSV file generated successfully." });
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 pb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Financial Audit</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">Global settlement registry & reconciliation hub</p>
        </div>
        <Button onClick={handleExport} className="h-16 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-3xl transition-all active:scale-95 gap-3">
          <FileDown size={20} /> Export Audit Archive (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-primary/10 border-primary/20 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
          <TrendingUp className="text-primary h-8 w-8 mb-6" />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">This Month Revenue</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">TSh {stats.thisMonth.toLocaleString()}</h3>
        </Card>
        
        <Card className="bg-card border-white/5 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><CreditCard size={120} /></div>
          <CheckCircle2 className="text-emerald-500 h-8 w-8 mb-6" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Verified Settlements</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{stats.count} Units</h3>
        </Card>

        <Card className="bg-card border-white/5 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Zap size={120} /></div>
          <Zap className="text-secondary h-8 w-8 mb-6 fill-current" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Terminal Flow Today</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{stats.today} Logs</h3>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by transaction ID, method or booking..." 
            className="h-14 pl-12 rounded-2xl bg-card border-white/5 shadow-xl text-white font-bold"
          />
        </div>
        <div className="flex items-center gap-3 bg-card px-6 h-14 rounded-2xl border border-white/5">
           <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Master Node: Verified Registry</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-card animate-pulse rounded-[3rem] border border-white/5" />
      ) : (
        <div className="bg-card rounded-[3.5rem] border border-white/5 shadow-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                <tr>
                  <th className="px-10 py-8">Operational Profile</th>
                  <th className="px-10 py-8">Ref / Code</th>
                  <th className="px-10 py-8">Settlement Amount</th>
                  <th className="px-10 py-8">Channel</th>
                  <th className="px-10 py-8 text-right">Node Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-10 py-40 text-center text-white/10 italic font-black uppercase text-[10px] tracking-[0.5em]">No transactional data detected in buffer.</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-all group cursor-default">
                    <td className="px-10 py-8">
                      <p className="text-sm font-black text-white uppercase">{p.createdAt ? format(p.createdAt.toDate(), "dd MMMM yyyy") : 'Registry Sync'}</p>
                      <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-widest">{p.createdAt ? format(p.createdAt.toDate(), "HH:mm 'GMT+3'") : '...'}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <span className="text-[11px] font-black text-primary font-mono tracking-tighter uppercase">{p.confirmationCode}</span>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
                           <ArrowRight size={10} /> {p.bookingCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-xl font-black text-emerald-500 tracking-tighter">TSh {p.amount?.toLocaleString()}</p>
                    </td>
                    <td className="px-10 py-8">
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg">
                        {p.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-none rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest shadow-2xl">
                        <ShieldCheck size={12} className="mr-2" /> Verified Node
                      </Badge>
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