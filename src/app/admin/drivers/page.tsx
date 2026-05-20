'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, addDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  UserCheck, 
  Search, 
  Phone, 
  MessageCircle, 
  Clock, 
  Car,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
  UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { notifyNewDriver } from '@/lib/n8nWebhook';

/**
 * Driver Dispatch Terminal.
 * Registry of all fleet personnel with operational status and assignment control.
 */
export default function DriverDispatchPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [cityInput, setCityInput] = useState('Dar es Salaam');
  const [savingDriver, setSavingDriver] = useState(false);

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !phoneInput) {
      alert("All fields are required.");
      return;
    }
    setSavingDriver(true);
    try {
      const newDocRef = await addDoc(collection(db, "users"), {
        displayName: nameInput,
        email: emailInput,
        phoneNumber: phoneInput,
        city: cityInput,
        role: "driver",
        nidaStatus: "verified",
        createdAt: new Date().toISOString()
      });

      notifyNewDriver({ 
        id: newDocRef.id, 
        fullName: nameInput, 
        email: emailInput, 
        phone: phoneInput 
      });
      setNameInput('');
      setEmailInput('');
      setPhoneInput('');
      setCityInput('Dar es Salaam');
      setIsOpen(false);
    } catch (err: any) {
      alert("Driver provisioning failed: " + err.message);
    } finally {
      setSavingDriver(false);
    }
  };

  const driversQuery = useMemoFirebase(() => 
    query(collection(db, "users"), where("role", "==", "driver")), 
    [db]
  );
  const { data: drivers, loading } = useCollection(driversQuery);

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    return drivers.filter(d => 
      `${d.displayName} ${d.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drivers, searchTerm]);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Driver Dispatch</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] italic">Fleet Personnel Registry Node 1.0</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="bg-primary/10 border border-primary/20 px-6 h-14 rounded-2xl flex items-center gap-4">
              <Zap className="text-primary h-5 w-5 fill-current animate-pulse" />
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase text-primary leading-none">{drivers?.length || 0} Personnel</p>
                 <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Registry Buffer</p>
              </div>
           </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl gap-3">
                   <UserPlus size={18} /> Provision Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border rounded-[2.5rem] p-10 max-w-md shadow-3xl text-foreground">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
                    <DialogTitle className="text-2xl font-black uppercase tracking-widest text-foreground">Provision Driver Node</DialogTitle>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-normal">Register personnel directly to the database without requiring full credentials login</p>
                  </div>
                  <form onSubmit={handleRegisterDriver} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Full Name</label>
                      <Input value={nameInput} onChange={e => setNameInput(e.target.value)} required placeholder="e.g. Clemence Ngunda" className="h-12 bg-muted border-none text-foreground font-bold rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Email Address</label>
                      <Input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} required placeholder="e.g. driver@voltarentals.co.tz" className="h-12 bg-muted border-none text-foreground font-bold rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Phone Number</label>
                      <Input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} required placeholder="e.g. +255 700 000 000" className="h-12 bg-muted border-none text-foreground font-bold rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Operating City</label>
                      <Input value={cityInput} onChange={e => setCityInput(e.target.value)} required placeholder="e.g. Dar es Salaam" className="h-12 bg-muted border-none text-foreground font-bold rounded-xl" />
                    </div>
                    <Button type="submit" disabled={savingDriver} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg mt-6">
                      {savingDriver ? "Provisioning..." : "Commit Driver Registry"}
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] shadow-xl border border-border overflow-hidden">
        <div className="p-8 border-b border-border bg-muted/20">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search personnel by name or email..." 
              className="pl-12 h-14 rounded-2xl bg-background border-border text-foreground font-bold" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[10px] font-black uppercase pl-10 py-6 text-muted-foreground tracking-widest">Personnel Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mission Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Operational Hub</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Registry ID</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase pr-10 text-muted-foreground tracking-widest">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-10"><Skeleton className="h-14 w-full rounded-2xl" /></TableCell></TableRow>)
              ) : filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-44 text-center">
                    <div className="space-y-4 opacity-20">
                       <UserCheck size={64} className="mx-auto" />
                       <p className="font-black uppercase text-[10px] tracking-[0.5em]">Zero Personnel Located</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map(d => (
                  <TableRow key={d.id} className="hover:bg-muted/30 transition-all border-border group">
                    <TableCell className="pl-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center font-black text-3xl shadow-xl">
                          {d.displayName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-lg font-black uppercase text-foreground leading-tight tracking-tight">{d.displayName || 'New Driver'}</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium tracking-wide">{d.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-full px-5 h-8 text-[9px] font-black uppercase tracking-widest shadow-inner">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-2.5" /> Standby Node
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-primary" />
                          <span className="text-[11px] font-black uppercase text-foreground tracking-tighter">{d.city || 'Dar es Salaam'}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase px-4 h-6 rounded-lg bg-primary/5">
                         <ShieldCheck size={12} className="mr-2" /> Vetted Identity
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <Button asChild size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-border text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 shadow-lg">
                             <a href={`https://wa.me/${d.phoneNumber?.replace(/\D/g, '')}`} target="_blank"><MessageCircle size={22} /></a>
                          </Button>
                          <Button asChild size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-border text-foreground hover:bg-blue-500/10 hover:text-blue-500 shadow-lg">
                             <a href={`tel:${d.phoneNumber}`}><Phone size={22} /></a>
                          </Button>
                       </div>
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
