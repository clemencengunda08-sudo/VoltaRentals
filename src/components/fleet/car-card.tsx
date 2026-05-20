'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  MapPin, 
  Heart, 
  ShieldCheck,
  Zap,
  GitCompare,
  TrendingDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VoltaImage } from "@/components/ui/VoltaImage";
import { useCompare } from "@/context/CompareContext";
import { useSound } from "@/hooks/use-sound";

interface CarCardProps {
  car: any;
  index: number;
  viewMode: "grid" | "list";
}

function CarCardComponent({ car, index, viewMode }: CarCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare, canAdd } = useCompare();
  const { playClick } = useSound();
  const inCompare = isInCompare(car.id);

  const hasDiscount = car.discountPrice && car.discountPrice < car.pricePerDay;
  const discountPercent = hasDiscount ? Math.round(((car.pricePerDay - car.discountPrice) / car.pricePerDay) * 100) : 0;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('volta_favorites') || '[]');
      setIsFavorite(favs.includes(car.id));
    }
  }, [car.id]);

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    const favs = JSON.parse(localStorage.getItem('volta_favorites') || '[]');
    let newFavs;
    if (isFavorite) {
      newFavs = favs.filter((id: string) => id !== car.id);
    } else {
      newFavs = [...favs, car.id];
    }
    localStorage.setItem('volta_favorites', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  }, [car.id, isFavorite, playClick]);

  const fuelInfo = useMemo(() => {
    const map: any = {
      Petrol: { icon: "⛽", color: "text-orange-500" },
      Diesel: { icon: "🛢", color: "text-amber-500" },
      Hybrid: { icon: "⚡", color: "text-emerald-500" },
      Electric: { icon: "🔋", color: "text-blue-500" }
    };
    return map[car.fuelType] || { icon: "⛽", color: "text-muted-foreground" };
  }, [car.fuelType]);

  const imageSrc = car.images?.[0] || null;

  const ImageDisplay = () => (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      <VoltaImage 
        src={imageSrc} 
        alt={`${car.make} ${car.model}`} 
        fill
        priority={index < 4}
        sizes={viewMode === "grid" 
          ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
          : "(max-width: 768px) 100vw, 400px"
        }
        className="transition-transform duration-700 md:group-hover:scale-105"
      />
      
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
         <Badge className="bg-primary border-none text-[8px] font-black tracking-widest h-6 px-3 uppercase shadow-2xl">
           {car.category}
         </Badge>
         {hasDiscount && (
           <Badge className="bg-emerald-500 border-none text-[8px] font-black tracking-widest h-6 px-3 uppercase shadow-2xl flex items-center gap-1">
             <TrendingDown size={10}/> {discountPercent}% OFF
           </Badge>
         )}
      </div>
      
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            playClick();
            inCompare ? removeFromCompare(car.id) : addToCompare(car);
          }}
          aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
          disabled={!canAdd && !inCompare}
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-200 backdrop-blur-md",
            inCompare ? "bg-primary border-primary text-white shadow-lg" : "bg-background/80 border-border text-foreground hover:border-primary/60"
          )}
        >
          <GitCompare size={14} />
        </motion.button>

        <button 
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="h-9 w-9 rounded-xl bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all active:scale-90 shadow-xl"
        >
          <Heart className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
        </button>
      </div>
    </div>
  );

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="executive-card group flex flex-col md:flex-row h-auto md:h-48 overflow-hidden"
      >
        <div className="relative w-full md:w-72 h-48 md:h-full shrink-0">
          <ImageDisplay />
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{car.make} {car.model}</h3>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black tracking-widest h-5 px-2 uppercase">{car.category}</Badge>
                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-muted-foreground">
                  <Users size={10} className="text-primary" /> {car.seats ?? 5} Seats
                </div>
                <div className={cn("flex items-center gap-1.5 text-[8px] font-black uppercase", fuelInfo.color)}>
                  <span>{fuelInfo.icon}</span> {car.fuelType}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">Reserve / Day</span>
              {hasDiscount ? (
                <div className="flex flex-col items-end">
                   <span className="text-[9px] text-muted-foreground line-through opacity-50">TSh {car.pricePerDay?.toLocaleString()}</span>
                   <span className="text-lg font-black text-emerald-500 tracking-tighter leading-none">TSh {car.discountPrice?.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-lg font-black text-foreground tracking-tighter leading-none">TSh {car.pricePerDay?.toLocaleString()}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground">
                   <MapPin size={10} className="text-primary" /> {car.location}
                </div>
                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-blue-400">
                   <ShieldCheck size={10} /> Insured
                </div>
             </div>
             <div className="flex gap-2">
               <Link href={`/cars/${car.id}`} onClick={playClick}>
                 <Button variant="outline" className="h-9 px-4 border-border text-foreground font-black uppercase text-[8px] tracking-widest rounded-xl hover:bg-muted transition-all">Specs</Button>
               </Link>
               <Link href={`/book?model=${car.id}`} onClick={playClick}>
                 <Button className="h-9 px-6 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[8px] tracking-widest shadow-xl rounded-xl gap-2">
                   <Zap size={10} className="fill-secondary text-secondary" /> Book
                 </Button>
               </Link>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="executive-card group h-full flex flex-col"
    >
      <div className="relative aspect-[16/10] border-b border-border">
        <ImageDisplay />
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{car.make} {car.model}</h3>
            <span className="text-[7px] font-black uppercase px-2 py-1 rounded-lg shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {car.transmission}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-4 border-y border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users size={12} className="text-primary" />
                <span className="text-[9px] font-black uppercase">{car.seats ?? 5} Seats</span>
              </div>
              <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase", fuelInfo.color)}>
                <span>{fuelInfo.icon}</span> {car.fuelType}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Reserve / Day</span>
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground line-through opacity-50">TSh {car.pricePerDay?.toLocaleString()}</span>
                  <span className="text-xl font-black text-emerald-500 tracking-tighter">TSh {car.discountPrice?.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-xl font-black text-foreground tracking-tighter">TSh {car.pricePerDay?.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link href={`/cars/${car.id}`} onClick={playClick}>
            <Button variant="outline" className="w-full h-11 border-border text-foreground font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-muted transition-all">Specs</Button>
          </Link>
          <Link href={`/book?model=${car.id}`} onClick={playClick}>
            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest shadow-xl rounded-xl gap-2">
              <Zap size={12} className="fill-secondary text-secondary" /> Book
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(CarCardComponent);
