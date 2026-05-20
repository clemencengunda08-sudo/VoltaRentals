'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, MapPin, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car } from "@/lib/types";
import { VoltaImage } from "./ui/VoltaImage";

interface SimilarVehiclesProps {
  category: string;
  currentCarId: string;
}

export function SimilarVehicles({ category, currentCarId }: SimilarVehiclesProps) {
  const db = useFirestore();
  
  const similarQuery = useMemoFirebase(() => {
    return query(
      collection(db, "cars"),
      where("category", "==", category),
      where("available", "==", true),
      limit(4)
    );
  }, [db, category]);

  const { data: cars, loading } = useCollection(similarQuery);
  const filteredCars = cars?.filter(c => c.id !== currentCarId).slice(0, 3);

  if (!loading && (!filteredCars || filteredCars.length === 0)) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black">Similar Vehicles</h2>
          <p className="text-muted-foreground mt-1">More premium {category}s you may like.</p>
        </div>
        <Link href="/fleet">
          <Button variant="ghost" className="font-bold gap-2 text-primary hover:text-primary">
            View All Fleet <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-[2rem] bg-muted animate-pulse" />
          ))
        ) : (
          filteredCars?.map((car) => (
            <Link key={car.id} href={`/cars/${car.id}`} className="group">
              <div className="bg-card rounded-[2rem] border border-border overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <VoltaImage 
                    src={car.images?.[0] || null} 
                    alt={car.model} 
                    fill 
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background/80 backdrop-blur-md text-foreground font-black border-none shadow-sm uppercase text-[9px] tracking-widest px-3 h-7">
                      TSh {car.pricePerDay.toLocaleString()} / day
                    </Badge>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{car.make}</div>
                  <h3 className="text-xl font-black mb-6 uppercase tracking-tight">{car.model}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/50 border border-border">
                      <Users className="h-4 w-4 text-primary mb-1" />
                      <span className="text-[9px] font-black">{car.seats}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/50 border border-border">
                      <Gauge className="h-4 w-4 text-primary mb-1" />
                      <span className="text-[9px] font-black truncate w-full text-center uppercase">{car.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/50 border border-border">
                      <MapPin className="h-4 w-4 text-primary mb-1" />
                      <span className="text-[9px] font-black truncate w-full text-center uppercase">{car.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
