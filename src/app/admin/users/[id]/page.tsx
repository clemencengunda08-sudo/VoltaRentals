'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, query, collection, where, limit, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  User, 
  Car, 
  ClipboardList, 
  MessageCircle,
  Clock,
  Loader2,
  ArrowRight
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const userRef = doc(db, "users", id);
  const { data: userProfile, loading } = useDoc(userRef);

  const bookingsQuery = useMemoFirebase(() => query(collection(db, "bookings"), where("userId", "==", id), limit(10)), [db, id]);
  const { data: bookings } = useCollection(bookingsQuery);

  /**
   * Executive Date Formatting Protocol.
   */
  const safeFormatDate = (dateVal: any, pattern: string = "MMMM yyyy") => {
    if (!dateVal) return 'Registry Pending';
    try {
      const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(dateObj.getTime())) return 'Registry Pending';
      return format(dateObj, pattern);
    } catch (e) {
      return 'Registry Pending';
    }
  };

  const safeFormatDistance = (dateVal: any) => {
    if (!dateVal) return 'Recently';
    try {
      const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(dateObj.getTime())) return 'Recently';
      return formatDistanceToNow(dateObj) + ' ago';
    } catch (e) {
      return 'Recently';
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsUpdating(true);
    try {
      await updateDoc(userRef, {
        adminNotes: arrayUnion({
          text: note,
          addedBy: 'staff',
          addedByName: 'Administrator',
          createdAt: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
      setNote("");
      toast({ title: "Internal note added" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!userProfile) return <div className="text-center py-20 font-black uppercase text-foreground">Customer profile not found.</div>;

  const totalSpent = bookings?.filter(b => b.paymentStatus === 'paid').reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/users">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-card border-border text-foreground"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/20">{userProfile.displayName?.charAt(0) || 'U'}</div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{userProfile.displayName}</h1>
                <Badge className={cn("rounded-full px-4 text-[10px] font-black uppercase border-none", userProfile.verified ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>{userProfile.verified ? 'Verified Node' : 'Unverified'}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-3">Client since {safeFormatDate(userProfile.createdAt)}</p>
            </div>
          </div>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-emerald-600/20">
          <Link href={getWhatsAppLink(userProfile.phoneNumber || '', `Hello ${userProfile.displayName}, regarding your VoltaRentals profile...`)} target="_blank"><MessageCircle className="h-5 w-5" /> Dispatch WhatsApp</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border p-6"><CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary"><User className="h-4 w-4" /> Identity Archive</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Email Node</p><p className="text-sm font-bold text-foreground">{userProfile.email}</p></div>
                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Contact Phone</p><p className="text-sm font-bold text-foreground">{userProfile.phoneNumber || 'N/A'}</p></div>
                <div className="space-y-1"><p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Primary City</p><p className="text-sm font-bold text-foreground">{userProfile.city || 'Dar es Salaam'}</p></div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-border shadow-sm bg-card overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border p-6"><CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary"><ClipboardList className="h-4 w-4" /> Deployment Stats</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6 text-center">
                <div className="grid grid-cols-2 gap-6">
                  <div><p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Total Orders</p><p className="text-3xl font-black text-foreground tracking-tighter">{bookings?.length || 0}</p></div>
                  <div><p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Invested</p><p className="text-lg font-black text-emerald-500">TSh {totalSpent.toLocaleString()}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[3rem] border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border p-8"><CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Elite Booking History</CardTitle></CardHeader>
            <CardContent className="p-0">
              {!bookings || bookings.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground italic font-medium uppercase text-[10px] tracking-widest opacity-30">No bookings detected in registry.</div>
              ) : (
                <div className="divide-y border-border">
                  {bookings.map(b => (
                    <div key={b.id} className="p-8 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-muted rounded-2xl shadow-inner border border-border"><Car className="h-6 w-6 text-primary" /></div>
                        <div>
                          <p className="text-sm font-black uppercase text-foreground leading-none">{b.vehicleName}</p>
                          <p className="text-[10px] text-primary font-black mt-2 font-mono tracking-widest">{b.bookingCode}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <p className="text-xs font-black text-foreground">TSh {b.totalPrice?.toLocaleString()}</p>
                          <p className="text-[8px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">{safeFormatDate(b.startDate, "dd MMM")} — {safeFormatDate(b.endDate, "dd MMM")}</p>
                        </div>
                        <Badge className="rounded-full text-[8px] font-black uppercase px-4 py-1 bg-muted border-border text-foreground">{b.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="rounded-[3rem] border-border shadow-2xl bg-card overflow-hidden sticky top-28">
            <CardHeader className="bg-primary text-white p-10"><CardTitle className="text-sm font-black uppercase tracking-[0.4em] leading-none">Internal CRM Console</CardTitle></CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary"><Clock className="h-4 w-4" /> Operational Logs</div>
                <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                  {userProfile.adminNotes?.map((n: any, i: number) => (
                    <div key={i} className="p-6 bg-muted rounded-[1.5rem] border border-border relative">
                      <p className="text-xs font-medium text-foreground leading-relaxed italic">"{n.text}"</p>
                      <div className="flex justify-between mt-6 text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 border-t border-border pt-4">
                        <span>{n.addedByName}</span>
                        <span>{safeFormatDistance(n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {(!userProfile.adminNotes || userProfile.adminNotes.length === 0) && (
                    <p className="text-center py-10 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-20">Zero internal logs.</p>
                  )}
                </div>
              </div>
              <Separator className="bg-border" />
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">New Operational Protocol</p>
                <Textarea 
                  placeholder="Log status update or internal memo..." 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  className="rounded-2xl text-xs h-32 resize-none border-border bg-muted/30 focus:border-primary transition-all p-5 text-foreground" 
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={isUpdating || !note.trim()} 
                  className="w-full rounded-2xl bg-primary text-white font-black uppercase tracking-widest h-14 shadow-xl shadow-primary/20 text-[10px] transition-all active:scale-95"
                >
                  Commit Note to Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}