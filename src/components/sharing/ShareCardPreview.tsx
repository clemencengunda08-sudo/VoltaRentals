'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareCardPreviewProps {
  car?: any;
  booking?: any;
  type: "car" | "booking";
}

export function ShareCardPreview({ car, booking, type }: ShareCardPreviewProps) {
  if (type === "car" && car) {
    return (
      <div className="w-full border border-border rounded-xl overflow-hidden bg-card shadow-sm mb-6">
        <div className="relative h-[120px] w-full bg-muted">
          {car.images?.[0] ? (
            <Image 
              src={car.images[0]} 
              alt={`${car.make} ${car.model}`} 
              fill 
              className="object-cover" 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/20 italic text-[10px]">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-tight text-foreground truncate">
            {car.year} {car.make} {car.model}
          </h4>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            {car.category} • {car.seats || '5'} Seats • {car.transmission}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs font-black text-primary">TSh {Number(car.pricePerDay).toLocaleString()}/day</span>
            <span className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground">
              <MapPin size={8} /> {car.location || 'Dar es Salaam'}
            </span>
          </div>
          <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] pt-1">
            VoltaRentals Tanzania 🇹🇿
          </p>
        </div>
      </div>
    );
  }

  if (type === "booking" && booking) {
    return (
      <div className="w-full border border-border rounded-xl p-4 bg-card shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Booking Confirmed!</h4>
            <p className="text-[9px] font-mono text-primary font-bold">{booking.bookingCode}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-black uppercase text-foreground">{booking.vehicleName}</p>
          <div className="flex items-center gap-2 text-[9px] font-medium text-muted-foreground">
            <Calendar size={10} className="text-primary" />
            {new Date(booking.startDate).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short' })} → 
            {new Date(booking.endDate).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        <p className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] pt-2 border-t border-border/50">
          VoltaRentals Tanzania 🇹🇿
        </p>
      </div>
    );
  }

  return null;
}
