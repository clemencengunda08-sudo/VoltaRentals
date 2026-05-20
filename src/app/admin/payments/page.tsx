'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
} from 'firebase/firestore';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Receipt
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { convertToCSV } from '@/lib/export';

export default function PaymentVerificationPage() {
  const db = useFirestore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
    return () => unsub();
  }, [db]);

  const stats = {
    total: payments.reduce((acc, p) => acc + (p.amount || 0), 0),
    count: payments.length,
    today: payments.filter(p => {
      const d = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
      return format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    }).length
  };

  const filtered = payments.filter(p => 
    (p.confirmationCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.bookingCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    convertToCSV(payments, 'verified_settlements');
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Finance Terminal</h1>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">Verified settlement audit and transactional records</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="h-14 px-8 border-border text-foreground font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-muted gap-3 shadow-xl">
          <Download size={18} /> Export Settlement CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-primary border-none rounded-[2rem] overflow-hidden shadow-2xl p-1">
          <div className="bg-card rounded-[1.9rem] p-8">
            <TrendingUp size={24} className="text-primary mb-4" />
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Global Revenue Node</p>
            <h3 className="text-3xl font-black text-foreground tracking-tighter">TSh {stats.total.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
          <CheckCircle2 size={24} className="text-emerald-500 mb-4" />
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Verified Entries</p>
          <h3 className="text-3xl font-black text-foreground tracking-tighter">{stats.count} Receipts</h3>
        </Card>
        <Card className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
          <Clock size={24} className="text-primary mb-4" />
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Today's Settlements</p>
          <h3 className="text-3xl font-black text-foreground tracking-tighter">{stats.today} Units</h3>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-card p-4 rounded-3xl border border-border">
          <div className="flex gap-2">
            {['all', 'pesapal', 'manual'].map(t => (
              <Button 
                key={t}
                onClick={() => setActiveTab(t)}
                variant={activeTab === t ? "default" : "ghost"}
                className={cn(
                  "rounded-xl px-6 h-11 font-black uppercase text-[9px] tracking-widest",
                  activeTab === t ? "bg-primary text-white" : "text-muted-foreground"
                )}
              >
                {t} Settlements
              </Button>
            ))}
          </div>
          
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search reference or tracking code..." 
              className="h-12 pl-12 bg-muted border-none text-foreground rounded-xl"
            />
          </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Date Protocol</th>
                <th className="px-8 py-6">Transaction ID</th>
                <th className="px-8 py-6">Booking Ref</th>
                <th className="px-8 py-6">Settlement</th>
                <th className="px-8 py-6 text-right">Channel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={5} className="p-10 animate-pulse"><div className="h-4 bg-muted rounded" /></td></tr>)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-40 text-center space-y-4">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground/20" />
                    <p className="text-muted-foreground italic font-black uppercase text-[10px] tracking-widest opacity-20">No financial data detected.</p>
                  </td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-foreground">{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'dd MMM yyyy') : '...'}</p>
                    <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase">{p.createdAt?.toDate ? format(p.createdAt.toDate(), 'HH:mm') : ''}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-primary font-mono tracking-tighter uppercase">{p.confirmationCode}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground/80 tracking-widest uppercase">{p.bookingCode}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-emerald-500">
                    TSh {p.amount?.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Badge className={cn(
                      "text-[8px] font-black uppercase tracking-widest border-none px-3 h-6 rounded-full",
                      p.source === 'manual' ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                    )}>
                      {p.paymentMethod || 'Manual Node'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
