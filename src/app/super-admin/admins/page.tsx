
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  doc, 
  updateDoc, 
  limit
} from 'firebase/firestore';
import { 
  Search, 
  MoreVertical, 
  UserPlus,
  Loader2,
  X,
  UserCog,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';

const ROLES: { id: UserRole; label: string; desc: string; color: string }[] = [
  { id: 'super_admin', label: 'Super Admin', desc: 'Full System Authority', color: 'bg-red-500' },
  { id: 'company_admin', label: 'Company Admin', desc: 'Fleet & Operation Management', color: 'bg-amber-500' },
  { id: 'staff', label: 'Operations Staff', desc: 'Booking & Support Handling', color: 'bg-blue-500' },
  { id: 'viewer', label: 'Auditor/Viewer', desc: 'Read-only Analytics Access', color: 'bg-slate-500' },
  { id: 'driver', label: 'Fleet Driver', desc: 'Logistics & Assignments', color: 'bg-emerald-500' },
];

export default function StaffManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    return query(collection(db, "users"), limit(100));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);

  const staffUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => u.role && u.role !== 'customer');
  }, [users]);

  const nonStaffUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const isCandidate = u.role === 'customer' || !u.role;
      if (!isCandidate) return false;
      
      if (u.createdAt) {
        try {
          const date = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
          const diffInMs = new Date().getTime() - date.getTime();
          const daysOld = diffInMs / (1000 * 3600 * 24);
          if (daysOld > 3) return false; // Filter out candidates older than 3 days
        } catch (e) {}
      }
      return true;
    });
  }, [users]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), { 
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      toast({ 
        title: "Authority Synchronized", 
        description: `Identity set to ${newRole}.` 
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsUpdating(null);
    }
  };

  const safeFormatDate = (dateVal: any) => {
    if (!dateVal) return 'Registry Pending';
    try {
      const dateObj = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(dateObj.getTime())) return 'Registry Pending';
      return format(dateObj, "dd MMM yyyy");
    } catch (e) {
      return 'Registry Pending';
    }
  };

  const filteredStaff = staffUsers.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Authority Registry</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Internal privilege oversight — Granular RBAC</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 h-10 px-6 rounded-xl font-black uppercase tracking-widest">
          {staffUsers.length} Logged Staff
        </Badge>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
        <Input 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search identity or registry email..." 
          className="h-14 pl-12 rounded-2xl bg-card border-white/5 shadow-xl text-white font-bold"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-44 bg-card animate-pulse rounded-[2.5rem] border border-white/5" />)
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-card rounded-[3rem] border border-dashed border-white/10">
            <ShieldAlert className="h-12 w-12 mx-auto text-primary/20 mb-4" />
            <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">No privileged identities located.</p>
          </div>
        ) : filteredStaff.map((staff) => (
          <Card key={staff.id} className="rounded-[2.5rem] border-white/5 shadow-2xl bg-card overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl">
                    {staff.displayName?.charAt(0) || 'A'}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{staff.displayName || 'Unnamed Staff'}</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{staff.email}</p>
                    <div className="flex items-center gap-3 pt-3">
                      <Badge className={cn(
                        "rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border-none",
                        ROLES.find(r => r.id === staff.role)?.color || "bg-primary/20"
                      )}>
                        {staff.role?.replace('_', ' ')}
                      </Badge>
                      <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Node Active
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl text-white/20 hover:text-white">
                      <MoreVertical size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-3xl bg-card border-white/10">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                       <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Modify Authority</p>
                    </div>
                    {ROLES.filter(r => r.id !== staff.role).map((r) => (
                      <DropdownMenuItem 
                        key={r.id}
                        onClick={() => handleUpdateRole(staff.id, r.id)}
                        className="rounded-xl h-11 font-black uppercase text-[10px] tracking-widest gap-3 text-white"
                      >
                        <UserCog size={16} className="text-primary" /> 
                        Set as {r.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem 
                      onClick={() => handleUpdateRole(staff.id, 'customer')}
                      className="rounded-xl h-11 font-black uppercase text-[10px] tracking-widest gap-3 text-red-500 focus:bg-red-500/10"
                    >
                      <X size={16} /> Demote to Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-20 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
            <UserPlus className="text-primary" /> Authority Provisioning
          </h2>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Select a registered traveler to assign a granular role</p>
        </div>

        <div className="bg-card rounded-[3rem] border border-white/5 shadow-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Traveler Profile</th>
                  <th className="px-8 py-6">Registry Entry</th>
                  <th className="px-8 py-6 text-right">Assign Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {nonStaffUsers.length === 0 ? (
                  <tr><td colSpan={3} className="px-8 py-32 text-center text-white/20 italic font-black uppercase text-[10px] tracking-widest">Zero candidates available for promotion.</td></tr>
                ) : nonStaffUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black uppercase text-white leading-none">{u.displayName || 'New Traveler'}</p>
                      <p className="text-[10px] text-white/40 font-bold mt-1 tracking-widest">{u.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                        {safeFormatDate(u.createdAt)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button disabled={isUpdating === u.id} className="h-10 px-6 rounded-xl bg-primary text-white font-black uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all gap-2">
                              {isUpdating === u.id ? <Loader2 className="animate-spin h-3 w-3" /> : "Appoint Role"}
                              <ChevronDown size={14} />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-card border-white/10">
                           {ROLES.map((r) => (
                             <DropdownMenuItem key={r.id} onClick={() => handleUpdateRole(u.id, r.id)} className="rounded-xl h-10 font-bold uppercase text-[9px] tracking-widest">
                                {r.label}
                             </DropdownMenuItem>
                           ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
