'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ShieldAlert, Trash2, Loader2, X, Filter } from "lucide-react";
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewManagementPage() {
  const db = useFirestore();
  const [filter, setFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const reviewsQuery = useMemoFirebase(() => query(collection(db, "reviews"), orderBy("createdAt", "desc")), [db]);
  const { data: reviews, loading } = useCollection(reviewsQuery);

  const stats = useMemo(() => {
    if (!reviews) return { total: 0, average: 0, flagged: 0 };
    const total = reviews.length;
    const flagged = reviews.filter(r => r.status === 'flagged').length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;
    return { total, average, flagged };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (filter === 'flagged') return reviews.filter(r => r.status === 'flagged');
    if (filter === 'hidden') return reviews.filter(r => r.status === 'hidden');
    return reviews;
  }, [reviews, filter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "reviews", id), { status, updatedAt: new Date().toISOString() });
      toast({ title: `Review ${status}` });
      setSelectedReview(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  const handlePostReply = async () => {
    if (!selectedReview || !reply.trim()) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "reviews", selectedReview.id), {
        adminReply: reply,
        adminReplyAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Reply Posted Successfully" });
      setSelectedReview(null);
      setReply("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      toast({ title: "Review Deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Feedback Moderation</h1>
        <p className="text-muted-foreground mt-1 uppercase text-[10px] font-black tracking-widest">Manage reputation and client sentiment</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Feedback", value: stats.total, icon: <MessageSquare />, color: "bg-blue-500/10 text-blue-500" },
          { label: "Fleet Rating", value: stats.average + " ⭐", icon: <Star />, color: "bg-amber-500/10 text-amber-500" },
          { label: "Flagged Protocol", value: stats.flagged, icon: <ShieldAlert />, color: "bg-red-500/10 text-red-500" },
        ].map((s, i) => (
          <Card key={i} className="rounded-[2rem] border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-8 flex items-center gap-8">
              <div className={cn("p-5 rounded-2xl", s.color)}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className="text-4xl font-black text-foreground tracking-tighter">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex gap-2">
            {['all', 'flagged', 'hidden'].map(f => (
              <Button 
                key={f} 
                variant={filter === f ? "default" : "ghost"} 
                onClick={() => setFilter(f)} 
                className={cn(
                  "rounded-xl px-8 font-black uppercase text-[10px] tracking-widest",
                  filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] font-black uppercase pl-8 text-muted-foreground">Client Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Vehicle Asset</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Sentiment Score</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Protocol Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase pr-8 text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-10"><div className="h-12 bg-muted animate-pulse rounded-2xl" /></TableCell></TableRow>)
              ) : filteredReviews.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-32 text-center text-muted-foreground italic font-medium">No feedback entries matching current filters.</TableCell></TableRow>
              ) : (
                filteredReviews.map(r => (
                  <TableRow key={r.id} className={cn("hover:bg-muted/30 transition-colors border-border", r.status === 'unread' && "bg-primary/5")}>
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{r.customerName?.charAt(0)}</div>
                        <div>
                           <div className="text-xs font-black uppercase text-foreground">{r.customerName}</div>
                           <p className="text-[9px] text-muted-foreground mt-1 font-medium">{r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy") : '...'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-[10px] font-black uppercase text-primary tracking-widest">{r.carName}</span></TableCell>
                    <TableCell>
                      <div className="flex text-amber-500 mb-1.5 gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} className={cn(s <= r.rating ? "fill-current" : "text-muted")} />)}
                      </div>
                      <p className="text-[10px] font-bold text-foreground line-clamp-1 uppercase tracking-tight">{r.title}</p>
                    </TableCell>
                    <TableCell><Badge className={cn("rounded-full px-4 py-1 text-[8px] font-black uppercase border-none", r.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : r.status === 'flagged' ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground")}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedReview(r); setReply(r.adminReply || ""); }} className="rounded-xl font-black text-[9px] uppercase gap-2 text-primary hover:bg-white dark:hover:bg-card shadow-sm"><MessageSquare size={14} /> Review & Reply</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="rounded-xl text-red-400 hover:text-red-600"><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedReview} onOpenChange={(o) => !o && setSelectedReview(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] bg-card border-border p-10 overflow-hidden text-foreground">
          <DialogHeader><h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">Feedback Protocol Audit</h2></DialogHeader>
          {selectedReview && (
            <div className="space-y-10 py-6">
              <div className="p-8 bg-muted/20 rounded-[2rem] border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Star size={100} className="text-primary" /></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex text-amber-500 gap-1.5">
                    {[1,2,3,4,5].map(s => <Star key={s} size={18} className={cn(s <= selectedReview.rating ? "fill-current" : "text-muted")} />)}
                  </div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{selectedReview.createdAt ? format(new Date(selectedReview.createdAt), "dd MMM yyyy, HH:mm") : '...'}</span>
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tight leading-none">{selectedReview.title}</h3>
                <p className="text-base text-foreground/70 leading-relaxed italic font-medium">"{selectedReview.comment}"</p>
                <div className="flex flex-wrap gap-2 mt-8">
                  {selectedReview.tags?.map((t: string) => <Badge key={t} variant="outline" className="rounded-full px-4 py-1 text-[8px] uppercase font-black border-border text-muted-foreground bg-muted/30 tracking-widest">{t}</Badge>)}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-primary"><MessageSquare size={16} /> Official Admin Response</div>
                <Textarea placeholder="Thank the client for their elite feedback..." value={reply} onChange={(e) => setReply(e.target.value)} className="rounded-[1.5rem] text-sm h-32 p-6 border-border bg-muted/20 resize-none focus:border-primary outline-none transition-all text-foreground" />
                <div className="flex gap-4">
                  <Button onClick={handlePostReply} disabled={isUpdating} className="flex-1 rounded-2xl h-16 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Post Official Response</Button>
                  {selectedReview.status !== 'hidden' ? (
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedReview.id, 'hidden')} className="flex-1 rounded-2xl h-16 text-red-500 border-red-500/20 bg-red-500/5 font-black uppercase tracking-widest text-xs hover:bg-red-500/10">Archive Review</Button>
                  ) : (
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedReview.id, 'published')} className="flex-1 rounded-2xl h-16 text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-black uppercase tracking-widest text-xs hover:bg-emerald-500/10">Publish Protocol</Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}