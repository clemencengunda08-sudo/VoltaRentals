'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  ClipboardList, 
  CheckCircle2, 
  CreditCard, 
  Megaphone,
  ChevronRight,
  Clock,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead } from "@/lib/notifications";

export default function AdminNotificationsPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const q = useMemoFirebase(() => {
    if (authLoading || !user) return null;
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [db, user?.uid, authLoading]);

  const { data: notifications, loading } = useCollection(q);

  const handleAction = async (notif: any) => {
    if (!notif.read) await markAsRead(db, notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_received': return <ClipboardList className="h-6 w-6 text-primary" />;
      case 'payment_received': return <CreditCard className="h-6 w-6 text-emerald-500" />;
      case 'payment_verified': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      default: return <Megaphone className="h-6 w-6 text-primary" />;
    }
  };

  const filtered = notifications?.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'bookings') return n.type === 'booking_received';
    if (filter === 'payments') return n.type === 'payment_received';
    return true;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Staff Alerts</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-black tracking-widest">Internal operational logs & triage</p>
        </div>
        {user && (
          <Button onClick={() => markAllAsRead(db, user.uid)} className="rounded-2xl font-black h-14 px-8 uppercase tracking-widest text-[10px] gap-3 bg-primary text-white shadow-xl shadow-primary/20">
            <Check className="h-4 w-4" /> Resolve All Protocol Alerts
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter} className="mb-10">
        <TabsList className="bg-muted border border-border p-1 rounded-2xl h-14">
          <TabsTrigger value="all" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:text-foreground">All Logs</TabsTrigger>
          <TabsTrigger value="unread" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:text-foreground">Unresolved</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:text-foreground">New Requests</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-card data-[state=active]:text-foreground">Settlements</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-[2.5rem]" />)
        ) : !filtered || filtered.length === 0 ? (
          <div className="text-center py-32 bg-card rounded-[3rem] border border-dashed border-border flex flex-col items-center gap-4">
            <Bell size={48} className="text-muted-foreground opacity-20" />
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Operational log empty</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <Card key={notif.id} className={cn(
              "rounded-[2.5rem] border-border shadow-sm transition-all overflow-hidden group",
              !notif.read ? "bg-card ring-1 ring-primary/20" : "bg-muted/30 opacity-60"
            )}>
              <CardContent className="p-8 flex gap-8 items-start">
                <div className="p-5 bg-background border border-border rounded-2xl shadow-sm group-hover:scale-105 transition-transform">{getIcon(notif.type)}</div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-black tracking-tight text-foreground">{notif.title}</h3>
                    {!notif.read && <Badge className="bg-blue-500 text-white border-none font-black uppercase text-[8px] rounded-full px-3 py-1">Action Required</Badge>}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-3xl">{notif.message}</p>
                  <div className="flex items-center gap-8 pt-6">
                    {notif.actionUrl && (
                      <Button onClick={() => handleAction(notif)} className="rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 bg-primary text-white h-11 px-8 shadow-lg shadow-primary/20">
                        Investigate Protocol <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                    <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                      <Clock className="h-3 w-3" /> {notif.createdAt && formatDistanceToNow(notif.createdAt.toDate())} ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Badge({ children, className }: any) {
  return <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>{children}</div>;
}