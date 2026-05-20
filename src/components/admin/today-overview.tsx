'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfDay, endOfDay } from "date-fns";
import { Car, User, Clock, AlertTriangle, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Today's Expedition Overview Widget.
 * FIXED: Theme adaptation for Light/Dark mode and contrast repair.
 */
export function TodayOverview() {
  const db = useFirestore();
  const today = new Date();

  const pickupsQuery = useMemoFirebase(() => {
    return query(
      collection(db, "bookings"),
      where("startDate", ">=", startOfDay(today).toISOString()),
      where("startDate", "<=", endOfDay(today).toISOString()),
      where("status", "==", "confirmed")
    );
  }, [db]);

  const returnsQuery = useMemoFirebase(() => {
    return query(
      collection(db, "bookings"),
      where("endDate", ">=", startOfDay(today).toISOString()),
      where("endDate", "<=", endOfDay(today).toISOString()),
      where("status", "==", "active")
    );
  }, [db]);

  const pendingQuery = useMemoFirebase(() => {
    return query(collection(db, "bookings"), where("status", "==", "pending"));
  }, [db]);

  const { data: pickups, loading: pickupsLoading } = useCollection(pickupsQuery);
  const { data: returns, loading: returnsLoading } = useCollection(returnsQuery);
  const { data: pending, loading: pendingLoading } = useCollection(pendingQuery);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Pickups Card */}
      <Card className="rounded-[2rem] border-border bg-card shadow-xl overflow-hidden transition-all hover:border-primary/20">
        <CardHeader className="bg-primary/10 border-b border-border p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Pickups Today
          </CardTitle>
          <Badge className="bg-primary text-white border-none rounded-full h-7 w-7 p-0 flex items-center justify-center font-black">
            {pickups?.length || 0}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {pickupsLoading ? (
              [1, 2].map(i => <div key={i} className="p-6 space-y-3"><Skeleton className="h-4 w-3/4 bg-muted" /><Skeleton className="h-3 w-1/2 bg-muted" /></div>)
            ) : !pickups || pickups.length === 0 ? (
              <div className="p-12 text-center">
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">"Registry Clear."</p>
              </div>
            ) : (
              pickups.map(b => (
                <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-all group">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-foreground">{b.vehicleName}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-2"><User size={10} className="text-primary" /> {b.userName}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                     <ChevronRight size={14} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Returns Card */}
      <Card className="rounded-[2rem] border-border bg-card shadow-xl overflow-hidden transition-all hover:border-accent/20">
        <CardHeader className="bg-accent/10 border-b border-border p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent" /> Returns Today
          </CardTitle>
          <Badge className="bg-accent text-white border-none rounded-full h-7 w-7 p-0 flex items-center justify-center font-black">
            {returns?.length || 0}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {returnsLoading ? (
              [1, 2].map(i => <div key={i} className="p-6 space-y-3"><Skeleton className="h-4 w-3/4 bg-muted" /><Skeleton className="h-3 w-1/2 bg-muted" /></div>)
            ) : !returns || returns.length === 0 ? (
              <div className="p-12 text-center">
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">"Registry Clear."</p>
              </div>
            ) : (
              returns.map(b => (
                <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between p-6 hover:bg-accent/5 transition-all group">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-foreground">{b.vehicleName}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-2"><User size={10} className="text-accent" /> {b.userName}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-white transition-all">
                     <ChevronRight size={14} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attention Card */}
      <Card className="rounded-[2rem] border-border bg-card shadow-xl overflow-hidden transition-all hover:border-secondary/20">
        <CardHeader className="bg-secondary/10 border-b border-border p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-foreground">
            <AlertTriangle className="h-4 w-4 text-secondary" /> Needs Attention
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Link href="/admin/bookings?status=pending" className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-secondary/10 transition-all border border-border group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-foreground">Pending Bookings</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase">Registry Buffer</p>
              </div>
            </div>
            <span className="text-xl font-black text-secondary">{pending?.length || 0}</span>
          </Link>

          <Link href="/admin/payments" className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 hover:bg-primary/10 transition-all border border-border group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 text-primary fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-foreground">Unverified Payments</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase">Financial Portal</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[7px] font-black uppercase border-primary/20 text-primary px-2 h-5">Verify</Badge>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
