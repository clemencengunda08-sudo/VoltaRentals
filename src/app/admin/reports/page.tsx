'use client';

import { useState } from 'react';
import { useFirestore } from "@/firebase";
import { 
  TrendingUp, 
  ClipboardList, 
  Car, 
  Users, 
  CreditCard, 
  FileDown, 
  ArrowLeft,
  Loader2,
  BarChart3,
  DollarSign,
  Briefcase
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { convertToCSV } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ReportsPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState<string | null>(null);

  const generateReport = async (id: string, collectionName: string) => {
    setLoading(id);
    try {
      const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (data.length === 0) {
        toast({ variant: "destructive", title: "Registry Empty", description: "No data available for export." });
        return;
      }
      
      convertToCSV(data, id);
      toast({ title: "Audit Exported", description: `Financial record for ${id} is ready.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Export Failed" });
    } finally {
      setLoading(null);
    }
  }

  const reports = [
    { id: "finance_audit", name: "Financial Ledger", desc: "Complete log of all settlements (Manual & Online).", icon: <DollarSign className="text-emerald-500" />, collection: "payments" },
    { id: "reservations", name: "Executive Reserves", desc: "History of fleet allocation and mission status.", icon: <Briefcase className="text-blue-500" />, collection: "bookings" },
    { id: "fleet_metrics", name: "Asset Utilization", desc: "Vehicle performance, mileage and rental counts.", icon: <Car className="text-purple-500" />, collection: "cars" },
    { id: "traveler_crm", name: "Elite Registry", desc: "Traveler profile data and membership status.", icon: <Users className="text-amber-500" />, collection: "users" },
    { id: "operational_logs", name: "System Alerts", desc: "History of all triage and staff communication.", icon: <CreditCard className="text-red-500" />, collection: "notifications" },
    { id: "sentiment", name: "Market Feedback", desc: "Customer experience scores and reviews.", icon: <BarChart3 className="text-indigo-500" />, collection: "reviews" }
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-card border-border"><ArrowLeft size={20} /></Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Audit Terminal</h1>
          <p className="text-muted-foreground uppercase text-[10px] font-black tracking-widest mt-1">Generate regulatory compliance CSV exports for accounting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((r) => (
          <Card key={r.id} className="border-border shadow-sm rounded-[2.5rem] bg-card overflow-hidden group hover:border-primary/20 transition-all">
            <CardContent className="p-10">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight leading-none">{r.name}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-10 h-10">{r.desc}</p>
              
              <Button 
                onClick={() => generateReport(r.id, r.collection)} 
                className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20"
                disabled={!!loading}
              >
                {loading === r.id ? <Loader2 className="animate-spin h-4 w-4" /> : <FileDown className="h-4 w-4" />}
                Export CSV Ledger
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
