'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Car as CarIcon, 
  Fuel, 
  Users, 
  TrendingUp, 
  ArrowRightLeft,
  Plus,
  Minus,
  Zap,
  Info
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";

const TZ_CITIES = [
  "Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya", 
  "Zanzibar", "Tanga", "Morogoro", "Iringa", "Moshi", 
  "Serengeti", "Ngorongoro"
];

const TZ_DISTANCES: Record<string, Record<string, number>> = {
  "Dar es Salaam": { "Arusha": 645, "Dodoma": 454, "Mwanza": 1085, "Mbeya": 857, "Zanzibar": 85, "Tanga": 350, "Morogoro": 196, "Iringa": 502, "Moshi": 565 },
  "Arusha": { "Dar es Salaam": 645, "Moshi": 80, "Dodoma": 356, "Mwanza": 560, "Serengeti": 320, "Ngorongoro": 180, "Mbeya": 800, "Tanga": 440 },
  "Dodoma": { "Dar es Salaam": 454, "Arusha": 356, "Mwanza": 700, "Mbeya": 415, "Morogoro": 260, "Iringa": 260 },
  "Mwanza": { "Dar es Salaam": 1085, "Arusha": 560, "Dodoma": 700, "Mbeya": 950 },
  "Moshi": { "Arusha": 80, "Dar es Salaam": 565, "Tanga": 360 },
  "Morogoro": { "Dar es Salaam": 196, "Dodoma": 260, "Iringa": 300, "Tanga": 300 },
  "Iringa": { "Dar es Salaam": 502, "Dodoma": 260, "Mbeya": 355, "Morogoro": 300 },
  "Mbeya": { "Dar es Salaam": 857, "Dodoma": 415, "Iringa": 355, "Arusha": 800 },
};

const FUEL_PRICE_PER_LITER = 3200; 
const AVG_CONSUMPTION_PER_100KM = 10;
const DRIVER_DAILY_FEE = 40000;
const EXTRA_KM_RATE = 500;
const FREE_KM_PER_DAY = 300;

export function TripEstimator() {
  const db = useFirestore();
  const [from, setFrom] = useState("Dar es Salaam");
  const [to, setTo] = useState("Arusha");
  const [days, setDays] = useState(1);
  const [withDriver, setWithDriver] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState("");

  const carsQuery = useMemoFirebase(() => query(collection(db, "cars"), where("available", "==", true), limit(20)), [db]);
  const { data: cars } = useCollection(carsQuery);

  const selectedCar = useMemo(() => cars?.find(c => c.id === selectedCarId) || cars?.[0], [cars, selectedCarId]);

  const estimate = useMemo(() => {
    if (!selectedCar) return null;
    const oneWay = TZ_DISTANCES[from]?.[to] || TZ_DISTANCES[to]?.[from] || 300;
    const totalDist = oneWay * 2;
    const rental = selectedCar.pricePerDay * days;
    const driver = withDriver ? DRIVER_DAILY_FEE * days : 0;
    const fuel = Math.round((totalDist / 100) * AVG_CONSUMPTION_PER_100KM * FUEL_PRICE_PER_LITER);
    const extra = Math.max(0, totalDist - (FREE_KM_PER_DAY * days)) * EXTRA_KM_RATE;
    return { distance: totalDist, rental, driver, fuel, extra, total: rental + driver + fuel + extra };
  }, [from, to, days, withDriver, selectedCar]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="executive-card p-6 md:p-10 space-y-8 md:space-y-10">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest"><TrendingUp size={10} /> Economic Intelligence</div>
             <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Trip Calculator</h2>
             <p className="text-muted-foreground text-xs font-medium">Estimate logistics for your next Tanzanian mission.</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">From (Hub)</label>
                <Select value={from} onValueChange={setFrom}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl bg-muted border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {TZ_CITIES.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">To (Destination)</label>
                <Select value={to} onValueChange={setTo}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl bg-muted border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {TZ_CITIES.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Asset Model</label>
                <Select value={selectedCarId || (cars?.[0]?.id)} onValueChange={setSelectedCarId}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl bg-muted border-none font-bold text-xs"><SelectValue placeholder="Select Car" /></SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {cars?.map(c => <SelectItem key={c.id} value={c.id} className="font-bold text-xs">{c.make} {c.model}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Duration</label>
                <div className="flex items-center gap-4 h-12 md:h-14 px-6 bg-muted rounded-xl">
                  <button onClick={() => setDays(Math.max(1, days - 1))} className="text-primary"><Minus size={18} /></button>
                  <span className="flex-1 text-center font-black text-lg">{days} Days</span>
                  <button onClick={() => setDays(days + 1)} className="text-primary"><Plus size={18} /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 md:p-6 bg-primary/5 rounded-2xl border border-primary/10">
               <div><p className="text-[10px] md:text-[11px] font-black uppercase">Chauffeur Service</p><p className="text-[8px] text-muted-foreground uppercase">TSh 40,000 / Day</p></div>
               <button onClick={() => setWithDriver(!withDriver)} className={cn("h-9 md:h-10 px-6 rounded-xl font-black text-[10px] uppercase transition-all", withDriver ? "bg-primary text-white shadow-xl" : "bg-muted text-muted-foreground")}>{withDriver ? "Active" : "None"}</button>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <AnimatePresence mode="wait">
            {estimate && (
              <motion.div key={`${from}-${to}-${days}-${withDriver}-${selectedCarId}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
                <div className="executive-card p-8 md:p-10 bg-primary text-white space-y-4 md:space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><TrendingUp size={160} /></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Total Trip Estimate</p>
                   <div className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums">TSh <AnimatedCounter end={estimate.total} /></div>
                   <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3"><MapPin size={16} /><span className="text-[9px] font-bold uppercase tracking-widest">{from} <ArrowRightLeft size={10} className="inline mx-2 opacity-40" /> {to}</span></div>
                      <Badge className="bg-white/20 text-white border-none uppercase text-[8px] px-3">Round Trip</Badge>
                   </div>
                </div>
                <div className="executive-card p-6 md:p-10 space-y-6 md:space-y-8">
                   <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary border-b border-border pb-4">Itinerary Breakdown</h3>
                   <div className="space-y-4">
                      {[
                        { icon: <MapPin size={16} />, label: "Total Distance", val: `${estimate.distance.toLocaleString()} km`, sub: "Round Trip Logic" },
                        { icon: <CarIcon size={16} />, label: "Base Rental", val: `TSh ${estimate.rental.toLocaleString()}`, sub: `${days} Days Protocol` },
                        { icon: <Users size={16} />, label: "Driver Service", val: `TSh ${estimate.driver.toLocaleString()}`, sub: withDriver ? `${days} Days Protocol` : "Self-Drive" },
                        { icon: <Fuel size={16} />, label: "Fuel Estimate", val: `TSh ${estimate.fuel.toLocaleString()}`, sub: "Estimated Market Rate" },
                        { icon: <Zap size={16} />, label: "Extra KM Node", val: `TSh ${estimate.extra.toLocaleString()}`, sub: "Over 300km/Day Allowance" },
                      ].map((item, i) => (
                        <div key={item.label} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-muted flex items-center justify-center text-primary">{item.icon}</div>
                            <div><p className="text-[9px] md:text-[10px] font-black uppercase text-foreground leading-none">{item.label}</p><p className="text-[7px] md:text-[8px] font-bold text-muted-foreground uppercase mt-1">{item.sub}</p></div>
                          </div>
                          <p className="text-xs md:text-sm font-black text-foreground">{item.val}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
