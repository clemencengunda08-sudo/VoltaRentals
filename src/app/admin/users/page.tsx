'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Clock, 
  MoreVertical, 
  Eye, 
  X
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CustomerManagementPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerified, setFilterVerified] = useState("all");

  const usersQuery = useMemoFirebase(() => query(collection(db, "users"), orderBy("createdAt", "desc")), [db]);
  const { data: users, loading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = `${u.displayName} ${u.email} ${u.phoneNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVerified = filterVerified === "all" || (filterVerified === "verified" ? u.verified : !u.verified);
      return matchesSearch && matchesVerified;
    });
  }, [users, searchTerm, filterVerified]);

  const handleVerify = async (userId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { verified: !current, updatedAt: new Date().toISOString() });
      toast({ title: !current ? "Customer Verified" : "Verification Removed" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  /**
   * Executive Date Formatting Protocol.
   * Safely handles Firestore Timestamps, Strings, and Date objects.
   */
  const safeFormatDistance = (dateVal: any) => {
    if (!dateVal) return 'Registry Pending';
    try {
      // Handle Firestore Timestamp structure or ISO string
      const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(dateObj.getTime())) return 'Registry Pending';
      return formatDistanceToNow(dateObj) + ' ago';
    } catch (e) {
      return 'Registry Pending';
    }
  };

  const stats = {
    total: users?.length || 0,
    verified: users?.filter(u => u.verified).length || 0,
    newThisWeek: users?.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
      return !isNaN(createdAt.getTime()) && createdAt > weekAgo;
    }).length || 0
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">Customer Registry</h1>
        <p className="text-muted-foreground mt-1 uppercase text-[10px] font-black tracking-widest">Management of all 2026 elite travelers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Customers", value: stats.total, icon: <Users />, color: "bg-blue-500/10 text-blue-500" },
          { label: "Verified Profile", value: stats.verified, icon: <ShieldCheck />, color: "bg-emerald-500/10 text-emerald-500" },
          { label: "New Registrations", value: stats.newThisWeek, icon: <Clock />, color: "bg-purple-500/10 text-purple-500" },
        ].map((s, i) => (
          <Card key={i} className="rounded-3xl border-border bg-card shadow-sm overflow-hidden">
            <CardContent className="p-6 flex items-center gap-6">
              <div className={cn("p-4 rounded-2xl", s.color)}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search client directory..." 
              className="pl-10 h-12 rounded-xl bg-background border-border text-foreground" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button variant="outline" className="rounded-xl h-12 gap-2 border-border text-foreground" onClick={() => setSearchTerm("")}><X className="h-4 w-4" /> Clear</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] font-black uppercase pl-8 text-muted-foreground">Customer Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Dispatch Phone</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Registry Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground">Authority Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase pr-8 text-muted-foreground">Operational Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-8"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>)
              ) : filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">No clients found matching your search.</TableCell></TableRow>
              ) : (
                filteredUsers.map(u => (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors border-border">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-4 py-2">
                        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
                          {u.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-foreground leading-none">{u.displayName || 'New Traveler'}</p>
                          <p className="text-[9px] text-muted-foreground mt-1.5 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs font-bold font-mono text-foreground">{u.phoneNumber || 'Registry ID Missing'}</span></TableCell>
                    <TableCell><span className="text-[10px] text-muted-foreground font-black uppercase">{safeFormatDistance(u.createdAt)}</span></TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-4 text-[8px] font-black uppercase border-none", u.verified ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>
                        {u.verified ? 'Verified Node' : 'Registry Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl w-56 p-2 shadow-2xl bg-card border-border">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 h-10 px-3 rounded-xl font-bold text-[10px] uppercase cursor-pointer text-foreground">
                              <Eye className="h-4 w-4 text-primary" /> View Profile Protocol
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(u.id, !!u.verified)} className="flex items-center gap-3 h-10 px-3 rounded-xl font-bold text-[10px] uppercase text-emerald-600 cursor-pointer">
                            <ShieldCheck className="h-4 w-4" /> {u.verified ? 'Revoke Verification' : 'Verify Identity'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
