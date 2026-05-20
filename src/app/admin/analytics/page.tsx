'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { 
  TrendingUp, 
  ArrowLeft,
  Zap,
  Gauge,
  Sparkles,
  BarChart3,
  Users,
  Loader2,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  getBookingTrends, 
  getRevenueStats,
  getOccupancyRate
} from "@/lib/analytics";
import { generateFleetStrategy, FleetStrategyOutput } from "@/ai/flows/fleet-strategy";
import { format } from "date-fns";

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

export default function AnalyticsPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [revStats, setRevStats] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [aiStrategy, setAiStrategy] = useState<FleetStrategyOutput | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [t, rs, oc] = await Promise.all([
          getBookingTrends(db, 30),
          getRevenueStats(db),
          getOccupancyRate(db)
        ]);
        setTrends(t);
        setRevStats(rs);
        setOccupancy(oc);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db]);

  const handleGenerateAiStrategy = async () => {
    if (occupancy.length === 0) return;
    setIsGeneratingAi(true);
    try {
      const strategy = await generateFleetStrategy({
        totalRevenue: revStats?.allTimeRevenue || 0,
        occupancyData: occupancy.map(o => ({
          carName: o.carName,
          rate: o.occupancyRate,
          category: o.category
        })),
        month: format(new Date(), 'MMMM yyyy')
      });
      setAiStrategy(strategy);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin"><Button variant="outline" size="icon" className="rounded-xl border-border bg-card text-foreground"><ArrowLeft size={20} /></Button></Link>
          <div>
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Intelligence Terminal</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logistical and financial performance analytics</p>
          </div>
        </div>
        <Button 
          onClick={handleGenerateAiStrategy} 
          disabled={isGeneratingAi || occupancy.length === 0}
          className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black uppercase text-xs gap-3 shadow-xl shadow-primary/20"
        >
          {isGeneratingAi ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles size={18} />}
          Generate Strategic AI Report
        </Button>
      </div>

      {aiStrategy && (
        <Card className="rounded-[3rem] border-primary/20 bg-primary/5 p-10 space-y-10 shadow-3xl animate-in zoom-in duration-500">
           <div className="flex items-center justify-between border-b border-primary/10 pb-8">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl"><Zap size={24} /></div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Executive Strategy Node</h3>
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Gemini AI Dynamic Analysis</p>
                 </div>
              </div>
              <Badge className="bg-primary text-white border-none uppercase text-[8px] font-black px-4 py-1.5 rounded-full">{aiStrategy.marketSentiment}</Badge>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Market Summary</p>
                 <p className="text-xl font-medium leading-relaxed italic opacity-80">"{aiStrategy.summary}"</p>
              </div>
              <div className="space-y-6">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Tactical Actions</p>
                 <div className="space-y-4">
                    {aiStrategy.recommendations.map((rec, i) => (
                      <div key={i} className="p-5 bg-card border border-border rounded-2xl flex items-start gap-4">
                         <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"><TrendingUp size={16} /></div>
                         <div>
                            <p className="text-xs font-black uppercase text-foreground">{rec.asset}</p>
                            <p className="text-sm font-bold text-primary mt-1">{rec.action}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{rec.impact}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </Card>
      )}

      <Tabs defaultValue="revenue" className="space-y-10">
        <TabsList className="bg-muted rounded-2xl p-1 h-14 border border-border">
          <TabsTrigger value="revenue" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Revenue Dive</TabsTrigger>
          <TabsTrigger value="fleet" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Fleet Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-border shadow-sm rounded-[2rem] bg-card overflow-hidden">
              <CardHeader className="p-8 border-b border-border bg-muted/20">
                <CardTitle className="text-xl font-black uppercase text-foreground">Daily Inflow</CardTitle>
                <CardDescription className="text-muted-foreground">Transactional velocity last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-8 h-[400px]">
                {!loading && trends.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{fontSize: 9, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} />
                      <YAxis tick={{fontSize: 9, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm rounded-[2rem] bg-card overflow-hidden">
              <CardHeader className="p-8 border-b border-border bg-muted/20">
                <CardTitle className="text-lg font-black uppercase text-foreground">Growth Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-12 text-center">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">This Month</p>
                  <h3 className="text-4xl font-black text-foreground tracking-tighter">TSh {revStats?.thisMonthRevenue?.toLocaleString()}</h3>
                  {revStats?.monthOverMonthGrowth > 0 && (
                    <Badge className="mt-4 bg-emerald-500/10 text-emerald-500 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                      +{revStats.monthOverMonthGrowth}% vs Last Month
                    </Badge>
                  )}
                </div>
                <div className="space-y-6 text-left pt-8 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Today</span>
                    <span className="font-bold text-foreground">TSh {revStats?.todayRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Verified</span>
                    <span className="font-bold text-primary">TSh {revStats?.allTimeRevenue?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-border shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                 <CardHeader className="p-10 bg-muted/20 border-b border-border">
                    <div className="flex items-center gap-3">
                       <Gauge className="text-primary h-6 w-6" />
                       <CardTitle className="text-xl font-black uppercase tracking-tight">Fleet Utilization (30D)</CardTitle>
                    </div>
                 </CardHeader>
                 <CardContent className="p-10 space-y-10">
                    {occupancy.map((car, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-sm font-black uppercase text-foreground">{car.carName}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{car.category}</p>
                             </div>
                             <p className="text-lg font-black text-primary tracking-tighter">{car.occupancyRate}%</p>
                          </div>
                          <Progress value={car.occupancyRate} className="h-2 rounded-full" />
                       </div>
                    ))}
                 </CardContent>
              </Card>

              <div className="space-y-8">
                 <Card className="border-primary/20 bg-primary/5 rounded-[2.5rem] p-10 border-dashed shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg"><Sparkles size={24} /></div>
                       <div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-foreground">AI Strategy Node</h3>
                          <p className="text-[10px] font-black uppercase text-primary tracking-widest">Real-time Optimization Recommendations</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       {occupancy.filter(c => c.occupancyRate > 75).map((car, i) => (
                         <div key={i} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-muted-foreground uppercase">High Demand Detected</p>
                               <p className="text-sm font-bold text-foreground">{car.carName} is at {car.occupancyRate}% capacity.</p>
                               <p className="text-xs text-emerald-500 font-black uppercase mt-2">↑ Rec: +TSh 20,000 Increase</p>
                            </div>
                            <Button size="icon" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><TrendingUp size={20} /></Button>
                         </div>
                       ))}
                       {occupancy.filter(c => c.occupancyRate < 30).map((car, i) => (
                         <div key={i} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-muted-foreground uppercase">Underutilized Asset</p>
                               <p className="text-sm font-bold text-foreground">{car.carName} is at {car.occupancyRate}% capacity.</p>
                               <p className="text-xs text-amber-500 font-black uppercase mt-2">↓ Rec: 15% Weekday Discount</p>
                            </div>
                            <Button size="icon" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><TrendingUp size={20} /></Button>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
