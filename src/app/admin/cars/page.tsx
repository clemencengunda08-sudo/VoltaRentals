'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Edit, Trash2, Car as CarIcon, 
  CheckCircle2, FileUp, Zap, TrendingDown, Clock, ShieldAlert
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, deleteDoc, doc, updateDoc, serverTimestamp, limit } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { notifyNewCar } from '@/lib/n8nWebhook';

export default function AdminCarsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeDiscountCar, setActiveDiscountCar] = useState<any>(null);
  const [newDiscountPrice, setNewDiscountPrice] = useState("");

  const carsQuery = useMemoFirebase(() => query(collection(db, "cars"), limit(100)), [db]);
  const { data: rawCars, loading } = useCollection(carsQuery);

  const filteredCars = useMemo(() => {
    if (!rawCars) return [];
    return rawCars.filter(car => 
      `${car.make} ${car.model} ${car.plateNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rawCars, searchTerm]);

  const handleApplyDiscount = async () => {
    if (!activeDiscountCar || !newDiscountPrice) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "cars", activeDiscountCar.id), {
        discountPrice: Number(newDiscountPrice),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Offer Protocol Active! 🏷️" });
      setActiveDiscountCar(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeDiscount = async (id: string) => {
    try {
      await updateDoc(doc(db, "cars", id), { discountPrice: null, updatedAt: serverTimestamp() });
      toast({ title: "Discount Revoked." });
    } catch (e) {}
  };

  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState('');

  const handleSyncN8N = async () => {
    if (!rawCars || rawCars.length === 0) return;
    setSyncing(true);
    let count = 0;
    try {
      for (const car of rawCars) {
        setSyncProgress(`Synced ${count}/${rawCars.length} cars...`);
        await notifyNewCar({
          id: car.id,
          make: car.make || car.brand || "",
          model: car.model || car.name || "",
          plateNumber: car.plateNumber || car.plate || "",
          category: car.category || car.type || "",
          dailyRate: Number(car.pricePerDay || car.dailyRate || car.rate || 0),
          status: car.available === false ? "Maintenance" : "Available",
          imageUrl: car.images?.[0] || car.imageUrl || car.image || ""
        });
        count++;
        setSyncProgress(`Synced ${count}/${rawCars.length} cars...`);
        await new Promise(r => setTimeout(r, 500)); // 500ms delay
      }
      toast({ title: `Successfully synced ${count} cars to n8n! ✅` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: e.message });
    } finally {
      setSyncing(false);
      setSyncProgress('');
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter leading-none">Fleet Control</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] italic">Manage inventory & active offers</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleSyncN8N} 
            disabled={syncing} 
            variant="outline" 
            className="h-14 px-8 rounded-2xl border-primary/20 text-primary gap-3 font-black uppercase text-[10px] tracking-widest"
          >
            {syncing ? syncProgress : "Sync Cars to n8n"}
          </Button>
          <Link href="/admin/cars/add"><Button className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-2xl shadow-2xl gap-3 font-black uppercase text-[10px] tracking-widest"><Plus size={22} /> Provision Asset</Button></Link>
        </div>
      </div>

      <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search registry..." className="pl-14 h-14 rounded-2xl bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 pl-10 py-6 uppercase text-[9px] font-black text-muted-foreground">Asset Visual</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground">Identifier</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground">Operational Rate</TableHead>
                <TableHead className="uppercase text-[9px] font-black text-muted-foreground text-right pr-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={4} className="p-10"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>)
              ) : filteredCars.map((car) => (
                <TableRow key={car.id} className="group hover:bg-primary/5 transition-all border-border">
                  <TableCell className="pl-10 py-6">
                    <div className="relative h-16 w-24 rounded-2xl overflow-hidden bg-muted border border-border">
                      <Image src={car.images?.[0] || "https://picsum.photos/seed/car/200/150"} alt={car.model} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-black text-primary uppercase text-sm tracking-tighter leading-tight">{car.make} {car.model}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Badge variant="outline" className="font-mono text-[9px] border-primary/20 text-primary">{car.plateNumber}</Badge>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">{car.category}</span>
                    </div>
                    {(() => {
                      const warnings: {text: string, type: 'warning' | 'destructive'}[] = [];
                      if (car.latraExpiry) {
                        const days = differenceInDays(new Date(car.latraExpiry), new Date());
                        if (days <= 14 && days >= 0) warnings.push({text: `LATRA in ${days}d`, type: 'warning'});
                        else if (days < 0) warnings.push({text: 'LATRA Expired', type: 'destructive'});
                      }
                      if (car.insuranceExpiry) {
                        const days = differenceInDays(new Date(car.insuranceExpiry), new Date());
                        if (days <= 14 && days >= 0) warnings.push({text: `INS in ${days}d`, type: 'warning'});
                        else if (days < 0) warnings.push({text: 'INS Expired', type: 'destructive'});
                      }
                      
                      if (warnings.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {warnings.map((w, i) => (
                              <Badge key={i} className={cn("text-[8px] px-2 py-0 h-4 font-black uppercase flex items-center gap-1 border-none", w.type === 'destructive' ? "bg-red-500 hover:bg-red-600 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-black")}>
                                <ShieldAlert size={10} /> {w.text}
                              </Badge>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className={cn("text-sm font-black", car.discountPrice ? "line-through opacity-30" : "text-foreground")}>TSh {car.pricePerDay?.toLocaleString()}</p>
                      {car.discountPrice && (
                        <p className="text-sm font-black text-emerald-500">OFFER: TSh {car.discountPrice.toLocaleString()}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex justify-end gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setActiveDiscountCar(car)} variant="outline" size="sm" className="h-11 rounded-xl gap-2 font-black uppercase text-[9px] text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10">
                            <TrendingDown size={14}/> Set Offer
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border rounded-[2.5rem]">
                           <DialogHeader><DialogTitle className="text-2xl font-black uppercase">Configure Offer</DialogTitle></DialogHeader>
                           <div className="space-y-6 py-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-primary ml-1">New Daily Rate (TSh)</label>
                                <Input type="number" value={newDiscountPrice} onChange={e => setNewDiscountPrice(e.target.value)} placeholder="e.g. 120000" className="h-14 bg-muted border-none font-black text-xl" />
                              </div>
                              <div className="flex gap-4">
                                <Button onClick={handleApplyDiscount} disabled={isUpdating} className="flex-1 h-14 bg-primary text-white font-black uppercase text-[10px]">Commit Offer</Button>
                                {car.discountPrice && <Button onClick={() => removeDiscount(car.id)} variant="ghost" className="text-red-500 text-[10px] font-black uppercase">Clear All</Button>}
                              </div>
                           </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Link href={`/admin/cars/edit/${car.id}`}>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-muted-foreground hover:text-primary transition-all"><Edit size={18} /></Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
