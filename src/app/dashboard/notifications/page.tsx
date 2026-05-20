'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Car, 
  Flag, 
  CreditCard, 
  AlertCircle, 
  Megaphone,
  Check,
  ChevronRight,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { markAsRead, markAllAsRead, deleteNotification } from "@/lib/notifications";

export default function NotificationsPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  // Simplified query for demo to avoid composite index error
  const q = useMemoFirebase(() => {
    if (authLoading || !user) return null;
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      limit(50)
    );
  }, [db, user?.uid, authLoading]);

  const { data: notifications, loading } = useCollection(q);

  // Manual sorting on client side instead of Firestore to avoid Index errors
  const sortedNotifications = notifications ? [...notifications].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(0);
    const dateB = b.createdAt?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }) : [];

  const handleAction = async (notif: any) => {
    if (!notif.read) await markAsRead(db, notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_received': return <ClipboardList className="h-6 w-6 text-blue-500" />;
      case 'booking_confirmed': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case 'booking_cancelled': return <XCircle className="h-6 w-6 text-red-500" />;
      case 'booking_active': return <Car className="h-6 w-6 text-purple-500" />;
      case 'booking_completed': return <Flag className="h-6 w-6 text-gray-500" />;
      case 'payment_received': return <CreditCard className="h-6 w-6 text-blue-500" />;
      case 'payment_verified': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case 'payment_rejected': return <AlertCircle className="h-6 w-6 text-orange-500" />;
      default: return <Megaphone className="h-6 w-6 text-blue-400" />;
    }
  };

  const filtered = sortedNotifications?.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'bookings') return n.type.includes('booking');
    if (filter === 'payments') return n.type.includes('payment');
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 bg-background">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-black text-primary uppercase">Alerts</h1>
              <p className="text-muted-foreground mt-1 uppercase text-[10px] font-black tracking-widest">Real-time updates for your travel</p>
            </div>
            {user && (
              <Button onClick={() => markAllAsRead(db, user.uid)} variant="outline" className="rounded-xl font-black h-12 uppercase tracking-widest text-[10px] gap-2 border-primary/10">
                <Check className="h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" onValueChange={setFilter} className="mb-8">
            <TabsList className="bg-primary/5 rounded-2xl p-1 h-14 w-full md:w-fit border border-primary/10">
              <TabsTrigger value="all" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">All</TabsTrigger>
              <TabsTrigger value="unread" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Unread</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Bookings</TabsTrigger>
              <TabsTrigger value="payments" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">Payments</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-32 bg-primary/5 animate-pulse rounded-[2rem]" />)
            ) : !filtered || filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-primary/10 space-y-4">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/20" />
                <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">No activity recorded</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <Card key={notif.id} className={cn(
                  "rounded-[2rem] border-none shadow-sm transition-all overflow-hidden relative group",
                  !notif.read ? "bg-white ring-2 ring-primary/5" : "bg-primary/5 opacity-80"
                )}>
                  <CardContent className="p-8 flex gap-6 items-start">
                    <div className="p-4 bg-background rounded-2xl shadow-sm ring-1 ring-primary/5">{getIcon(notif.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className={cn("text-lg font-black tracking-tight", notif.read ? "text-primary/60" : "text-primary")}>{notif.title}</h3>
                        {!notif.read && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">{notif.message}</p>
                      <div className="flex flex-wrap items-center gap-6 pt-4">
                        {notif.actionUrl && (
                          <Button onClick={() => handleAction(notif)} className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-primary text-white h-10 px-6">
                            View <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                          <Clock className="h-3 w-3" /> {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate()) : 'Recently'} ago
                        </span>
                        <div className="flex gap-2">
                          {!notif.read && <Button variant="ghost" size="sm" onClick={() => markAsRead(db, notif.id)} className="text-[9px] font-black uppercase h-8 hover:bg-primary/5">Mark read</Button>}
                          <Button variant="ghost" size="sm" onClick={() => deleteNotification(db, notif.id)} className="text-[9px] font-black uppercase h-8 text-red-400 hover:text-red-600 hover:bg-red-50">Delete</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}