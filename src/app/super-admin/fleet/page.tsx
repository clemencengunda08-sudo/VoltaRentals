'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  Plus, Trash2, Edit3, ShieldCheck, Search, ChevronDown, CheckCircle2, XCircle, Filter
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function FleetManagement() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  useEffect(() => {
    async function loadCars() {
      try {
        const q = query(collection(db, 'cars'), limit(100));
        const snap = await getDocs(q);
        setCars(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, []);

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'cars', id), { available: !current, updatedAt: serverTimestamp() });
      setCars(prev => prev.map(c => c.id === id ? {...c, available: !current} : c));
      toast({ title: `Asset ${!current ? 'Available' : 'Restricted'}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Update failed" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ABORT PROTOCOL: Permanently remove ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'cars', id));
      setCars(prev => prev.filter(c => c.id !== id));
      toast({ title: "Asset De-registered" });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  const filtered = cars.filter(c => {
    const matchesSearch = `${c.make} ${c.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'All' || c.category === activeCategory;
    const matchesAvail = availabilityFilter === 'All' || (availabilityFilter === 'Available' ? c.available : !c.available);
    return matchesSearch && matchesCat && matchesAvail;
  });

  return (
    <div className="space-y-12 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Fleet Registry</h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Manage VoltaRentals vehicle inventory node</p>
        </div>
        <Link href='/super-admin/fleet/new'>
          <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-3xl gap-3">
            <Plus size={18} /> Provision New Asset
          </Button>
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by make, model..." 
            className="h-12 pl-12 bg-muted border-none rounded-xl text-white font-bold"
          />
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          {['All', 'Available', 'Unavailable'].map(f => (
            <button 
              key={f} 
              onClick={() => setAvailabilityFilter(f)}
              className={cn("px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", availabilityFilter === f ? "bg-primary text-white" : "text-muted-foreground hover:text-white")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="executive-card h-80 animate-pulse bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-44 text-center executive-card border-dashed">
           <span className="text-6xl block mb-6">🚗</span>
           <h3 className="text-xl font-black uppercase tracking-tighter">No Vehicles Located</h3>
           <p className="text-muted-foreground text-sm italic mt-2">"Registry Buffer Empty."</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map(car => (
            <div key={car.id} className="executive-card group">
              <div className="relative aspect-[16/11] overflow-hidden bg-muted border-b border-border">
                {car.images?.[0] ? (
                  <Image src={car.images[0]} alt={car.model} fill className="object-cover group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">🚗</div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge className={cn("border-none px-3 h-6 text-[8px] font-black uppercase", car.available ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive")}>
                    {car.available ? 'Available' : 'Restricted'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{car.make} {car.model}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{car.year} • {car.category}</p>
                    <Badge variant="outline" className="font-mono text-[9px] border-border text-muted-foreground">{car.plateNumber}</Badge>
                  </div>
                </div>
                
                <div className="text-xl font-black text-primary">TSh {car.pricePerDay?.toLocaleString()}<span className="text-[9px] text-muted-foreground">/day</span></div>
                
                <div className="pt-4 border-t border-border flex items-center gap-3">
                  <Link href={`/admin/cars/edit/${car.id}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 bg-muted border-none rounded-lg text-[9px] font-black uppercase tracking-widest">Edit Details</Button>
                  </Link>
                  <Button 
                    onClick={() => toggleAvailability(car.id, !!car.available)}
                    className={cn("h-10 px-4 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all", car.available ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent")}
                  >
                    {car.available ? 'Restrict' : 'Release'}
                  </Button>
                  <Button onClick={() => handleDelete(car.id, car.model)} variant="ghost" className="h-10 w-10 text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

