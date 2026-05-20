'use client';

import { useState } from 'react';
import { collection, getDocs, writeBatch, doc, setDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  Database, 
  Trash2, 
  RefreshCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  Car, 
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MaintenancePage() {
  const [loading, setLoading] = useState<string | null>(null);

  const clearCollection = async (collectionName: string) => {
    setLoading(collectionName);
    try {
      const snap = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      toast({ title: "Protocol Executed", description: `Collection '${collectionName}' cleared.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Protocol Error", description: e.message });
    } finally {
      setLoading(null);
    }
  };

  const seedDemoCars = async () => {
    setLoading('seeding');
    try {
      const cars = [
        { make: 'Toyota', model: 'Land Cruiser V8', category: 'SUV', pricePerDay: 350000, seats: 7, transmission: 'Automatic', fuelType: 'Diesel', location: 'Dar es Salaam', available: true, images: ['https://images.unsplash.com/photo-1594568284297-7c6446821728?q=80&w=800'], description: 'Executive SUV for off-road and city tours.' },
        { make: 'Range Rover', model: 'Vogue', category: 'Luxury', pricePerDay: 550000, seats: 5, transmission: 'Automatic', fuelType: 'Petrol', location: 'Masaki', available: true, images: ['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?q=80&w=800'], description: 'Supreme luxury for elite events.' },
        { make: 'Mercedes-Benz', model: 'V-Class', category: 'Van', pricePerDay: 400000, seats: 8, transmission: 'Automatic', fuelType: 'Diesel', location: 'Airport (JNIA)', available: true, images: ['https://images.unsplash.com/photo-1630138977114-1f7c13204369?q=80&w=800'], description: 'Premium group transport for corporate clients.' },
        { make: 'Toyota', model: 'Alphard', category: 'Van', pricePerDay: 250000, seats: 7, transmission: 'Automatic', fuelType: 'Petrol', location: 'Oysterbay', available: true, images: ['https://images.unsplash.com/photo-1517524008436-bbdb633c68f1?q=80&w=800'], description: 'Comfortable family and business van.' },
      ];

      for (const car of cars) {
        const ref = doc(collection(db, 'cars'));
        await setDoc(ref, {
          id: ref.id,
          ...car,
          plateNumber: `T ${Math.floor(100 + Math.random() * 899)} ABC`,
          addedBy: 'system',
          rating: 4.8,
          totalRentals: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      toast({ title: "Assets Provisioned", description: "Demo fleet has been restored." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Seeding Error", description: e.message });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4 border-b border-border pb-10">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em]">
          <ShieldAlert size={12} /> System Maintenance Mode
        </div>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-none text-foreground">
          Command <span className="text-primary italic">Protocol</span>
        </h1>
        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em]">Administrative Data & Registry Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transactional Data */}
        <Card className="rounded-[2.5rem] bg-card border-border shadow-3xl overflow-hidden relative group">
           <CardHeader className="p-10 border-b border-border bg-red-500/5">
              <CardTitle className="text-sm font-black uppercase tracking-[0.4em] text-red-500">Transaction Wipe</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground mt-2 italic">Irreversible removal of all booking and payment records.</CardDescription>
           </CardHeader>
           <CardContent className="p-10 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                <AlertTriangle className="text-red-500 shrink-0" size={24} />
                <p className="text-[10px] text-red-500/70 font-bold leading-relaxed uppercase">Warning: Clearing these collections will reset all revenue stats and client history.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="h-14 border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                      {loading === 'bookings' ? <Loader2 className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                      Clear Booking Registry
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border rounded-3xl p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Initiate Data Wipe?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium uppercase text-muted-foreground">
                        This will permanently delete all booking records from the database. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8">
                      <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px]">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => clearCollection('bookings')} className="h-12 bg-red-600 rounded-xl font-black uppercase text-[10px]">Confirm Wipe</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="h-14 border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                      {loading === 'payments' ? <Loader2 className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                      Clear Payment Ledger
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border rounded-3xl p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter text-red-500">Confirm Ledger Wipe</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm font-medium uppercase text-muted-foreground">
                        All financial payment records will be purged. Financial reports will be zeroed out.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8">
                      <AlertDialogCancel className="h-12 rounded-xl font-black uppercase text-[10px]">Abort</AlertDialogCancel>
                      <AlertDialogAction onClick={() => clearCollection('payments')} className="h-12 bg-red-600 rounded-xl font-black uppercase text-[10px]">Execute Purge</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
           </CardContent>
        </Card>

        {/* Fleet Management */}
        <Card className="rounded-[2.5rem] bg-card border-border shadow-3xl overflow-hidden relative group">
           <CardHeader className="p-10 border-b border-border bg-emerald-500/5">
              <CardTitle className="text-sm font-black uppercase tracking-[0.4em] text-emerald-500">Fleet Control & Seeding</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground mt-2 italic">Manage asset registry and demo content.</CardDescription>
           </CardHeader>
           <CardContent className="p-10 space-y-6">
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => clearCollection('cars')}
                  disabled={!!loading}
                  variant="outline" 
                  className="h-14 border-border text-muted-foreground hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  {loading === 'cars' ? <Loader2 className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                  Wipe Asset Registry
                </Button>

                <Button 
                  onClick={seedDemoCars}
                  disabled={!!loading}
                  className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl transition-all flex items-center gap-2"
                >
                  {loading === 'seeding' ? <Loader2 className="animate-spin" /> : <RefreshCcw size={16} />}
                  Provision Demo Fleet
                </Button>
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border mt-4">
                 <p className="text-[9px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Demo Units Payload:</p>
                 <div className="space-y-2">
                    {['Land Cruiser V8', 'Range Rover Vogue', 'Mercedes V-Class', 'Toyota Alphard'].map(car => (
                      <div key={car} className="flex items-center gap-2 text-[10px] font-bold text-foreground/60 uppercase italic">
                         <CheckCircle2 size={10} className="text-emerald-500" /> {car}
                      </div>
                    ))}
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Global Reset */}
      <Card className="rounded-[3rem] bg-zinc-950 text-white border-none shadow-3xl overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
           <Zap size={200} className="text-primary" />
         </div>
         <CardContent className="p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
               <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Factory <span className="text-primary italic">Reset</span></h2>
               <p className="max-w-md text-white/50 font-bold uppercase text-[10px] tracking-[0.2em] leading-relaxed italic">
                 Wipe everything: Fleet, Bookings, Payments, and Reviews. 
                 Master Node accounts (Admins) will be preserved for security.
               </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-16 px-10 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-3xl shadow-red-600/20 group">
                   <ShieldAlert size={18} className="mr-3 group-hover:animate-pulse" /> Final Protocol: WIPE SYSTEM
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl p-10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-3xl font-black uppercase tracking-tighter text-red-500">Nuclear Protocol Warning</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs font-black uppercase text-white/40 tracking-widest mt-4 leading-loose">
                    You are about to initiate a global system wipe. 
                    <br/><br/>
                    1. All Car Assets will be deleted.
                    <br/>
                    2. All Reservation Logs will be purged.
                    <br/>
                    3. All Financial Ledgers will be wiped.
                    <br/>
                    4. All Customer Feedback will be erased.
                    <br/><br/>
                    Admins will keep their access. THIS IS IRREVERSIBLE.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-12 gap-4">
                  <AlertDialogCancel className="h-14 bg-white/5 border-none text-white rounded-xl font-black uppercase text-[10px]">Abort Mission</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={async () => {
                      await clearCollection('bookings');
                      await clearCollection('payments');
                      await clearCollection('cars');
                      await clearCollection('reviews');
                      toast({ title: "System Resetted", description: "All operational data purged." });
                    }}
                    className="h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[10px]"
                  >
                    Confirm Nuclear Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
         </CardContent>
      </Card>
    </div>
  );
}
