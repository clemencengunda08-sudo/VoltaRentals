'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent 
} from "@/components/ui/sheet";
import { 
  Mail, 
  MessageSquare, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock,
  Loader2,
  X
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const db = useFirestore();
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const q = useMemoFirebase(() => query(collection(db, "messages"), orderBy("createdAt", "desc")), [db]);
  const { data: messages, loading } = useCollection(q);

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "messages", id), { status: "read" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
      toast({ title: "Message deleted" });
      setSelectedMsg(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const filtered = messages?.filter(m => {
    if (filter === 'unread') return m.status === 'unread';
    if (filter === 'read') return m.status === 'read';
    return true;
  });

  const unreadCount = messages?.filter(m => m.status === 'unread').length || 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Inquiry Terminal</h1>
          <p className="text-muted-foreground mt-1 uppercase text-[10px] font-black tracking-widest">Manage public contact form submissions</p>
        </div>
        {unreadCount > 0 && <Badge className="bg-primary text-white font-black px-5 h-11 rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-widest text-[9px]">{unreadCount} UNREAD INQUIRIES</Badge>}
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex gap-3 bg-muted/20">
          {['all', 'unread', 'read'].map(f => (
            <Button 
              key={f} 
              variant={filter === f ? "default" : "ghost"} 
              onClick={() => setFilter(f)} 
              className={cn(
                "rounded-xl px-8 font-black uppercase text-[10px] tracking-widest",
                filter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] font-black uppercase pl-8 text-muted-foreground">Inquirer Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Subject Protocol</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Content Preview</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Logged</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase pr-8 text-muted-foreground">Operational Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-10"><div className="h-12 bg-muted animate-pulse rounded-2xl" /></TableCell></TableRow>)
              ) : !filtered || filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-24 text-center text-muted-foreground italic font-medium">No inquiries matching registry filters.</TableCell></TableRow>
              ) : (
                filtered.map(m => (
                  <TableRow key={m.id} className={cn("hover:bg-muted/30 transition-colors border-border", m.status === 'unread' && "bg-primary/5")}>
                    <TableCell className="pl-8 py-6">
                      <div>
                        <p className="text-xs font-black uppercase text-foreground leading-none">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{m.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[8px] font-black uppercase rounded-full border-border text-foreground px-3">{m.subject}</Badge></TableCell>
                    <TableCell><p className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs font-medium">{m.message}</p></TableCell>
                    <TableCell><span className="text-[10px] font-black text-muted-foreground uppercase">{m.createdAt ? formatDistanceToNow(m.createdAt.toDate()) : '...'} ago</span></TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedMsg(m); if(m.status === 'unread') handleMarkRead(m.id); }} 
                          className="rounded-xl font-black text-[9px] uppercase gap-2 text-primary hover:bg-white dark:hover:bg-card shadow-sm"
                        >
                          <Eye size={14} /> Inspect
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 rounded-xl"><Trash2 size={14} /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={!!selectedMsg} onOpenChange={(o) => !o && setSelectedMsg(null)}>
        <SheetContent className="w-full sm:max-w-xl rounded-l-[3rem] p-0 border-none overflow-hidden bg-card text-foreground">
          {selectedMsg && (
            <div className="h-full flex flex-col">
              <div className="bg-primary p-12 text-white space-y-6">
                 <div className="flex justify-between items-start">
                    <Badge className="bg-white/20 text-white border-none font-black uppercase tracking-widest text-[9px]">{selectedMsg.subject}</Badge>
                    <Button variant="ghost" onClick={() => setSelectedMsg(null)} className="h-8 w-8 p-0 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><X size={20} /></Button>
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{selectedMsg.name}</h2>
                    <p className="text-white/60 text-sm font-medium tracking-tight">{selectedMsg.email} • {selectedMsg.phone || 'Registry ID Missing'}</p>
                 </div>
              </div>
              <div className="flex-1 p-12 space-y-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Inquiry Transcript</p>
                  <p className="text-xl font-medium text-foreground leading-relaxed italic opacity-80">"{selectedMsg.message}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className="h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl">
                    <a href={`mailto:${selectedMsg.email}`}><Mail size={18} /> Reply Email</a>
                  </Button>
                  <Button asChild variant="outline" className="h-16 rounded-[1.5rem] border-emerald-200 text-emerald-700 font-black uppercase text-[10px] tracking-widest gap-3 hover:bg-emerald-50">
                    <a href={`https://wa.me/${selectedMsg.phone?.replace(/\D/g, '')}`} target="_blank"><MessageSquare size={18} /> WhatsApp</a>
                  </Button>
                </div>
                <div className="pt-10 border-t border-border">
                  <Button variant="ghost" onClick={() => handleDelete(selectedMsg.id)} className="w-full h-14 rounded-2xl text-red-500 font-black uppercase text-[9px] tracking-[0.3em] gap-3">
                    <Trash2 size={16} /> Permanently De-register Inquiry
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
