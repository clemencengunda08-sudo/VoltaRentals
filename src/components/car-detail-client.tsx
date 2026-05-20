'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Star, Users, Gauge, CheckCircle2, 
  Loader2, Zap, Info, ShieldCheck, Heart, 
  Award, Clock, MapPin, ChevronRight, ArrowLeft
} from "lucide-react";
import { notifyNewBooking } from '@/lib/n8nWebhook';
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { useUser, useFirestore } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Car, Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn, generateBookingCode } from "@/lib/utils";
import { sendBookingCreatedNotification } from "@/lib/notifications";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import { motion, useScroll, useSpring } from "framer-motion";
import { ShareButton } from "@/components/sharing/ShareButton";
import Link from 'next/link';

interface CarDetailClientProps {
  car: Car;
  reviews: Review[];
}

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "BOT Regulated",     sub: "Bank of Tanzania" },
  { icon: Award,       label: "Verified Fleet",    sub: "50-point inspection" },
  { icon: Clock,       label: "24/7 Support",      sub: "Always available"  },
  { icon: MapPin,      label: "TZ Nationwide",     sub: "7 cities covered"  },
];

const VOLTA_WHATSAPP = "+255700000000";

function getPeakSeason(): { isPeak: boolean; label: string } {
  const month = new Date().getMonth() + 1;
  if ([6, 7, 8].includes(month)) {
    return { isPeak: true, label: "🦁 Safari Season — High Demand" };
  }
  if ([12, 1].includes(month)) {
    return { isPeak: true, label: "🎄 Holiday Season — Limited Units" };
  }
  if (month === 4) {
    return { isPeak: true, label: "🐣 Easter Peak — Book Early" };
  }
  return { isPeak: false, label: "" };
}

export function CarDetailClient({ car, reviews }: CarDetailClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [withDriver, setWithDriver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SCROLL PROGRESS PROTOCOL
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const peakSeason = useMemo(() => getPeakSeason(), []);

  const images = car.images && car.images.length > 0 ? car.images : [];
  const safeMainSrc = images[activeImageIndex] || null;

  const whatsappMessage = encodeURIComponent(
    `Hello Volta Rentals! I'm interested in the ${car.make} ${car.model}. ` +
    `Could you provide more details? (Ref: ${car.plateNumber})`
  );

  const priceData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const totalDays = Math.max(1, differenceInCalendarDays(dateRange.to, dateRange.from) + 1);
    const carCost = totalDays * car.pricePerDay;
    const driverCost = withDriver ? totalDays * (car.withDriverCostPerDay || 50000) : 0;
    return { totalDays, subtotal: carCost, driverCost, total: carCost + driverCost };
  }, [dateRange, withDriver, car]);

  const handleBookNow = async () => {
    if (!user) {
      router.push(`/auth?redirect=/cars/${car.id}`);
      return;
    }
    if (!priceData || !dateRange) return;

    setIsSubmitting(true);
    const bookingCode = generateBookingCode();
    const newDocRef = doc(collection(db, "bookings"));
    
    const bookingData = {
      id: newDocRef.id,
      bookingCode,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email?.split('@')[0] || 'Traveler',
      userPhone: "", 
      vehicleId: car.id,
      vehicleName: `${car.make} ${car.model}`,
      vehiclePlate: car.plateNumber,
      vehicleImage: images[0] || "",
      pricePerDay: car.pricePerDay,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      totalDays: priceData.totalDays,
      totalPrice: priceData.total,
      driverIncluded: withDriver,
      driverFee: priceData.driverCost,
      status: "pending",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(newDocRef, bookingData);
      
      notifyNewBooking(bookingData, car);

      await sendBookingCreatedNotification(db, {
        userId: user.uid,
        customerName: bookingData.userName,
        customerPhone: "", 
        bookingCode,
        vehicleName: bookingData.vehicleName,
        startDate: format(dateRange.from, "dd MMM"),
        endDate: format(dateRange.to, "dd MMM"),
        totalPrice: bookingData.totalPrice,
        type: "booking_received"
      });

      toast({ title: "Protocol Initiated! 🚀", description: "Oda yako imeingizwa kwenye registry." });
      router.push(`/dashboard/bookings/${newDocRef.id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Registry Sync Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeatureEmoji = (f: string) => {
    const map: any = {
      'Air Conditioning': '❄️', 'GPS Navigation': '🗺️', 'Bluetooth Audio': '🎵',
      'USB Charging': '🔌', 'Backup Camera': '📷', 'Sunroof': '☀️',
      'With Driver Available': '👤', '4WD/AWD': '🔧', 'Leather Seats': '💺'
    };
    return map[f] || '✅';
  };

  return (
    <div className="space-y-16 relative">
      {/* ── SCROLL PROGRESS BAR ── */}
      <motion.div
        className="fixed top-14 left-0 right-0 h-[2px] z-40 origin-left"
        style={{
          scaleX,
          background: "linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))",
          boxShadow: "0 0 10px hsla(var(--primary) / 0.5)"
        }}
      />

      <AnimatedSection direction="down" delay={0.1}>
        <Link href="/fleet">
          <Button variant="ghost" className="mb-4 rounded-xl text-muted-foreground hover:text-primary gap-2 p-0">
            <ArrowLeft size={16} /> Back to Fleet Registry
          </Button>
        </Link>
      </AnimatedSection>

      {/* SECTION 1 - GALLERY */}
      <AnimatedSection direction="scale" delay={0} className="space-y-4">
        <div className="relative aspect-[16/9] w-full rounded-[1.5rem] overflow-hidden bg-muted flex items-center justify-center border border-border shadow-2xl">
          {safeMainSrc ? (
            <Image src={safeMainSrc} alt={car.model} fill className="object-cover transition-all duration-700" priority unoptimized />
          ) : (
            <span className="text-8xl">🚗</span>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImageIndex(i)}
                className={cn(
                  "relative h-20 w-32 rounded-xl overflow-hidden border-2 shrink-0 transition-all",
                  activeImageIndex === i ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img} alt="Thumb" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* SECTION 2 - HEADER & BOOKING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full px-5 py-1.5 font-black uppercase text-[10px] tracking-[0.2em]">
                  {car.category} Protocol
                </Badge>
                {peakSeason.isPeak && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[8px] font-black uppercase tracking-widest"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {peakSeason.label}
                  </motion.div>
                )}
              </div>
              <ShareButton shareType="car" data={car} variant="icon" />
            </div>

            <div className="flex items-start justify-between gap-6">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">
                {car.make} <br/><span className="text-primary italic">{car.model}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-sm font-black uppercase tracking-widest">
              <span>{car.year}</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>{car.transmission}</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>{car.fuelType}</span>
              <div className="h-1 w-1 rounded-full bg-border" />
              <span>{car.seats} PAX</span>
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-secondary">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-black text-sm">{car.rating || '5.0'} ({reviews.length} Reviews)</span>
              </div>
            )}
          </div>

          {/* TRUST BADGES SECTION */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {TRUST_BADGES.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border min-w-[160px] shadow-sm"
              >
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <badge.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-foreground">
                    {badge.label}
                  </p>
                  <p className="text-[8px] text-muted-foreground">
                    {badge.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tighter uppercase">Integrated Amenities</h3>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-3" staggerDelay={0.05}>
              {(car.features || []).map(f => (
                <StaggerItem key={f}>
                  <div className="bg-muted border border-border rounded-[1rem] px-5 py-3 text-[11px] font-bold text-foreground flex items-center gap-3 shadow-sm">
                    <span>{getFeatureEmoji(f)}</span> {f}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <AnimatedSection direction="up" delay={0.3} className="executive-card p-10 space-y-6">
            <h3 className="text-xl font-black tracking-tighter uppercase">Asset Narrative</h3>
            <p className="text-muted-foreground leading-relaxed italic text-lg">
              "{car.description || "Elite logistical asset configured for Tanzanian executive standards. Guaranteed reliability for all mission profiles."}"
            </p>
          </AnimatedSection>
        </div>

        {/* RIGHT COLUMN - BOOKING CARD */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <AnimatedSection direction="left" delay={0.3} className="executive-card p-10 space-y-10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Daily Reserve</p>
                  <div className="text-4xl font-black text-primary tracking-tighter">TSh {car.pricePerDay?.toLocaleString()}</div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">/ Day</span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-16 rounded-xl bg-muted border-none flex-col items-start px-5 gap-1">
                        <span className="text-[8px] font-black uppercase opacity-40">Pickup</span>
                        <span className="text-xs font-black">{dateRange?.from ? format(dateRange.from, "dd MMM") : "Select"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">< Calendar mode="single" selected={dateRange?.from} onSelect={d => setDateRange(p => ({from: d!, to: p?.to || addDays(d!, 1)}))} /></PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-16 rounded-xl bg-muted border-none flex-col items-start px-5 gap-1">
                        <span className="text-[8px] font-black uppercase opacity-40">Return</span>
                        <span className="text-xs font-black">{dateRange?.to ? format(dateRange.to, "dd MMM") : "Select"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">< Calendar mode="single" selected={dateRange?.to} onSelect={d => setDateRange(p => ({from: p?.from || new Date(), to: d!}))} /></PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center justify-between p-5 bg-muted rounded-xl">
                  <div><p className="text-xs font-black uppercase">Professional Chauffeur</p><p className="text-[9px] text-muted-foreground uppercase">+TSh 50k / Day</p></div>
                  <Switch checked={withDriver} onCheckedChange={setWithDriver} />
                </div>

                {priceData && (
                  <div className="p-6 rounded-2xl bg-primary/5 border border-dashed border-primary/20 space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase opacity-40"><span>Reserve Protocol</span><span>{priceData.totalDays} Days</span></div>
                    <div className="flex justify-between items-end border-t border-primary/10 pt-4"><span className="text-[10px] font-black uppercase text-primary">Total Investment</span><span className="text-3xl font-black tracking-tighter">TSh {priceData.total.toLocaleString()}</span></div>
                  </div>
                )}

                <Button 
                  onClick={handleBookNow}
                  disabled={isSubmitting || !dateRange}
                  className="w-full h-16 bg-primary text-primary-foreground font-black tracking-[0.2em] uppercase text-xs rounded-xl shadow-2xl transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Commit Reservation"}
                </Button>
              </div>
            </AnimatedSection>

            {/* WHATSAPP QUICK INQUIRY */}
            <a
              href={`https://wa.me/${VOLTA_WHATSAPP}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500/10 transition-colors shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.397-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.405.015 12.044c0 2.123.555 4.194 1.608 6.019L0 24l6.135-1.61a11.77 11.77 0 005.912 1.654h.005c6.632 0 12.028-5.406 12.03-12.046a11.751 11.751 0 00-3.469-8.513z"/>
                </svg>
                Quick Inquiry via WhatsApp
              </motion.div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
