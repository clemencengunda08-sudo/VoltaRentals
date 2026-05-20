'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Car, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  Filter,
  Users,
  Fuel,
  Gauge
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
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { notifyNewCar } from '@/lib/n8nWebhook';

export default function FleetRegistryPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCars(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [db]);

  const toggleAvailability = async (carId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'cars', carId), { available: !current, updatedAt: serverTimestamp() });
      toast({ title: `Vehicle marked as ${!current ? 'Available' : 'Unavailable'}` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const handleDelete = async (carId: string, name: string) => {
    if (!confirm(`Permanently remove ${name} from registry?`)) return;
    try {
      const deletedCar = cars.find(c => c.id === carId);
      await deleteDoc(doc(db, 'cars', carId));

      if (deletedCar) {
        notifyNewCar({
          id: carId,
          make: deletedCar.make || "",
          model: deletedCar.model || name,
          plateNumber: deletedCar.plateNumber || deletedCar.licensePlate || "",
          category: deletedCar.category || "",
          dailyRate: deletedCar.pricePerDay || 0,
          status: "Deleted",
          imageUrl: deletedCar.images?.[0] || "",
          description: "Deleted"
        }).then(res => console.log("Webhook success:", res))
          .catch(err => console.error("Webhook error:", err));
      }

      toast({ title: 'Vehicle removed from registry' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete failed' });
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = `${car.make} ${car.model} ${car.licensePlate}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
    const matchesAvailability = availabilityFilter === 'All' || 
                                (availabilityFilter === 'Available' ? car.available : !car.available);
    return matchesSearch && matchesCategory && matchesAvailability;
  }).sort((a, b) => {
    if (sortOrder === 'price-asc') return a.pricePerDay - b.pricePerDay;
    if (sortOrder === 'price-desc') return b.pricePerDay - a.pricePerDay;
    return 0; // Default newest by onSnapshot query
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Fleet Registry</h1>
          <p className="text-[hsl(213,25%,65%)] mt-2 font-medium">Core inventory management terminal — {cars.length} Vehicles Total</p>
        </div>
        <Link href="/admin/fleet/new">
          <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl gap-3">
            <Plus size={20} /> Add New Vehicle
          </Button>
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 bg-[hsl(220,43%,11%)] border border-[hsl(220,35%,18%)] p-4 rounded-[2rem] shadow-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(213,25%,45%)]" size={18} />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search make, model, or plate ID..." 
            className="h-12 pl-12 bg-[hsl(220,38%,14%)] border-none text-white rounded-xl"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 border-[hsl(220,35%,18%)] bg-[hsl(220,38%,14%)] text-white rounded-xl gap-2 font-bold px-5">
                <Filter size={16} className="text-primary" /> Category: {categoryFilter} <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(218,38%,17%)] border-[hsl(220,35%,18%)] rounded-xl text-white">
              {['All', 'Sedan', 'SUV', 'Van', 'Luxury', 'Truck', 'Pickup'].map(c => (
                <DropdownMenuItem key={c} onClick={() => setCategoryFilter(c)} className="font-bold rounded-lg">{c}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 border-[hsl(220,35%,18%)] bg-[hsl(220,38%,14%)] text-white rounded-xl gap-2 font-bold px-5">
                Status: {availabilityFilter} <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(218,38%,17%)] border-[hsl(220,35%,18%)] rounded-xl text-white">
              {['All', 'Available', 'Unavailable'].map(s => (
                <DropdownMenuItem key={s} onClick={() => setAvailabilityFilter(s)} className="font-bold rounded-lg">{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 border-[hsl(220,35%,18%)] bg-[hsl(220,38%,14%)] text-white rounded-xl gap-2 font-bold px-5">
                Sort: {sortOrder === 'newest' ? 'Newest' : sortOrder === 'price-asc' ? 'Price Low-High' : 'Price High-Low'} <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(218,38%,17%)] border-[hsl(220,35%,18%)] rounded-xl text-white">
              <DropdownMenuItem onClick={() => setSortOrder('newest')} className="font-bold">Newest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('price-asc')} className="font-bold">Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('price-desc')} className="font-bold">Price: High to Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-[450px] bg-white/5 animate-pulse rounded-[2.5rem]" />)
        ) : filteredCars.map((car) => (
          <Card key={car.id} className="bg-[hsl(220,43%,11%)] border-[hsl(220,35%,18%)] rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl">
            <div className="relative h-56 overflow-hidden">
              <Image 
                src={car.images?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop'} 
                alt={car.model} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,43%,11%)] via-transparent to-transparent opacity-60" />
              <div className="absolute top-5 right-5">
                <Badge className={cn(
                  "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl",
                  car.available 
                    ? "bg-[hsl(161,55%,14%)] text-[hsl(161,84%,62%)] border-[hsl(161,55%,25%)]" 
                    : "bg-[hsl(0,55%,16%)] text-[hsl(0,84%,70%)] border-[hsl(0,55%,28%)]"
                )}>
                  {car.available ? 'Ready for Booking' : 'Active / Maintenance'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{car.make} {car.model}</h3>
                  <p className="text-[10px] text-[hsl(213,25%,45%)] font-black uppercase tracking-[0.3em] mt-2">{car.licensePlate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-[hsl(213,25%,45%)] uppercase tracking-widest mb-1">Standard Rate</p>
                  <p className="text-2xl font-black text-amber-500 tracking-tighter">TSh {car.pricePerDay?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[hsl(220,40%,14%)] border border-white/5">
                  <Users size={14} className="text-primary mb-1.5" />
                  <span className="text-[10px] font-black text-white/60">{car.seats} PAX</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[hsl(220,40%,14%)] border border-white/5">
                  <Fuel size={14} className="text-primary mb-1.5" />
                  <span className="text-[10px] font-black text-white/60 uppercase">{car.fuelType?.charAt(0)}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[hsl(220,40%,14%)] border border-white/5">
                  <Gauge size={14} className="text-primary mb-1.5" />
                  <span className="text-[10px] font-black text-white/60 uppercase">{car.transmission?.slice(0, 3)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {(car.features || []).slice(0, 3).map((f: string) => (
                  <span key={f} className="px-3 py-1.5 bg-[hsl(220,40%,16%)] text-[hsl(213,25%,72%)] text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                    {f}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
                <Link href={`/admin/fleet/${car.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full h-12 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all gap-2">
                    <Edit3 size={14} /> Update Detail
                  </Button>
                </Link>
                <Button 
                  onClick={() => toggleAvailability(car.id, car.available)}
                  className={cn(
                    "w-full h-12 font-black uppercase text-[10px] tracking-widest rounded-xl gap-2 shadow-lg transition-all",
                    car.available ? "bg-amber-500 hover:bg-amber-600 text-[hsl(222,47%,8%)]" : "bg-emerald-500 hover:bg-emerald-600 text-[hsl(222,47%,8%)]"
                  )}
                >
                  {car.available ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {car.available ? 'Off-Registry' : 'Set Available'}
                </Button>
                <Button 
                  onClick={() => handleDelete(car.id, `${car.make} ${car.model}`)}
                  variant="ghost" 
                  className="col-span-2 mt-2 h-10 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-black uppercase text-[9px] tracking-[0.3em] rounded-xl"
                >
                  <Trash2 size={12} className="mr-2" /> De-Register Vehicle
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCars.length === 0 && !loading && (
          <div className="col-span-full py-40 text-center flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-[hsl(213,25%,45%)]">
              <Car size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Fleet Matches Found</h3>
              <p className="text-[hsl(213,25%,65%)] mt-2">Adjust your search parameters or add a new logistical asset.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}