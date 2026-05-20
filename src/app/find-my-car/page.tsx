'use client';

import { useState, useMemo } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Car as CarIcon, 
  Zap, 
  ShieldCheck, 
  Heart,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Car } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── QUIZ CONFIGURATION ───────────────────────────────────────

const MISSIONS = [
  { id: "safari",   label: "Safari Adventure",  emoji: "🦁", desc: "SUV, 4WD required" },
  { id: "wedding",  label: "Wedding / Event",   emoji: "💍", desc: "Luxury & status" },
  { id: "business", label: "Business Trip",     emoji: "💼", desc: "Reliability & prestige" },
  { id: "airport",  label: "Airport Transfer",  emoji: "✈️", desc: "Space & punctuality" },
  { id: "beach",    label: "Beach Holiday",     emoji: "🏖️", desc: "Zanzibar style" },
  { id: "family",   label: "Family Road Trip",  emoji: "👨‍👩‍👧‍👦", desc: "Maximum capacity" },
];

const PEOPLE_RANGES = [
  { id: 2,  label: "1 - 2 People",  desc: "Sedan / Luxury" },
  { id: 4,  label: "3 - 4 People",  desc: "SUV / Sedan" },
  { id: 7,  label: "5 - 7 People",  desc: "Van / Large SUV" },
  { id: 20, label: "8+ People",     desc: "Bus / Coaster" },
];

const COMFORT_LEVELS = [
  { id: "budget",  label: "Just Transport", emoji: "🎯", desc: "Economical & efficient" },
  { id: "comfy",   label: "Comfortable Ride", emoji: "⭐", desc: "Standard amenities" },
  { id: "luxury",  label: "Full Luxury",    emoji: "👑", desc: "Elite status experience" },
];

const SPECIAL_NEEDS = [
  { id: "gps",    label: "GPS Navigation", icon: MapPin },
  { id: "driver", label: "Professional Driver", icon: Users },
  { id: "ac",     label: "A/C (Cold Air)", icon: Zap },
  { id: "trunk",  label: "Large Trunk Space", icon: CarIcon },
];

// ── MATCHING LOGIC ───────────────────────────────────────────

function calculateMatchScore(car: Car, answers: any): number {
  let score = 0;

  // 1. Mission Matching (30%)
  if (answers.mission === "safari" && car.category === "SUV") score += 30;
  if (answers.mission === "wedding" && car.category === "Luxury") score += 30;
  if (answers.mission === "business" && (car.category === "Sedan" || car.category === "Luxury")) score += 30;
  if (answers.mission === "airport" && (car.category === "Sedan" || car.category === "Van")) score += 25;
  if (answers.mission === "family" && (car.category === "Van" || car.category === "Bus")) score += 30;

  // 2. Capacity (25%)
  if (answers.travelers === 20 && (car.category === "Bus" || car.category === "Van" || car.category === "Minibus")) score += 25;
  else if (car.seats >= answers.travelers) score += 25;
  else if (car.seats >= answers.travelers - 1) score += 10;

  // 3. Comfort Level (25%)
  if (car.classTier) {
     if (answers.comfort === "luxury" && car.classTier === "Luxury") score += 25;
     if (answers.comfort === "budget" && car.classTier === "Economical") score += 25;
     if (answers.comfort === "comfy" && car.classTier === "Comfortable") score += 25;
  } else {
     if (answers.comfort === "luxury" && car.category === "Luxury") score += 25;
     if (answers.comfort === "budget" && car.pricePerDay < 150000) score += 25;
     if (answers.comfort === "comfy" && car.pricePerDay >= 150000 && car.pricePerDay <= 300000) score += 25;
  }

  // 4. Special Needs (20%)
  answers.needs.forEach((need: string) => {
    const hasFeature = car.features?.some(f => f.toLowerCase().includes(need.toLowerCase()));
    if (hasFeature) score += (20 / answers.needs.length);
  });

  return Math.min(Math.round(score), 100);
}

// ── COMPONENT ────────────────────────────────────────────────

export default function FindMyCarPage() {
  const db = useFirestore();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    mission: "",
    travelers: 0,
    comfort: "",
    needs: [] as string[]
  });

  const carsQuery = useMemoFirebase(() => query(collection(db, "cars"), where("available", "==", true)), [db]);
  const { data: cars, loading } = useCollection(carsQuery);

  const recommendations = useMemo(() => {
    if (!cars || step !== 5) return [];
    return cars
      .map(car => ({
        ...car,
        score: calculateMatchScore(car as Car, answers)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [cars, answers, step]);

  const toggleNeed = (id: string) => {
    setAnswers(prev => ({
      ...prev,
      needs: prev.needs.includes(id) 
        ? prev.needs.filter(n => n !== id) 
        : [...prev.needs, id]
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* HEADER NODE */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Fleet Advice Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Find Your <span className="text-primary italic">Volta</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium italic">"Tell us your mission, we'll provide the mechanical excellence."</p>
          </div>

          {/* PROGRESS NODE */}
          {step < 5 && (
            <div className="mb-12 space-y-4">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                <span>PHASE {step} OF 4</span>
                <span>{Math.round((step / 4) * 100)}% ANALYZED</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  className="h-full bg-primary shadow-[0_0_15px_hsla(var(--primary)/0.5)]"
                />
              </div>
            </div>
          )}

          {/* WIZARD TERMINAL */}
          <div className="relative min-h-[450px]">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: MISSION */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">What's your primary mission?</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {MISSIONS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setAnswers({...answers, mission: m.id}); nextStep(); }}
                        className={cn(
                          "executive-card group p-8 text-center space-y-4 transition-all",
                          answers.mission === m.id ? "border-primary bg-primary/5 scale-105 shadow-2xl" : "hover:border-primary/30"
                        )}
                      >
                        <span className="text-5xl block group-hover:scale-110 transition-transform">{m.emoji}</span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{m.label}</p>
                          <p className="text-[8px] text-muted-foreground uppercase font-bold mt-1 opacity-60">{m.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PEOPLE */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">How many elite travelers?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PEOPLE_RANGES.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setAnswers({...answers, travelers: p.id}); nextStep(); }}
                        className={cn(
                          "executive-card flex items-center justify-between p-8 group transition-all",
                          answers.travelers === p.id ? "border-primary bg-primary/5 scale-[1.02]" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="text-left">
                          <p className="text-xl font-black uppercase">{p.label}</p>
                          <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase mt-1">{p.desc}</p>
                        </div>
                        <Users className={cn("h-8 w-8 transition-colors", answers.travelers === p.id ? "text-primary" : "text-muted-foreground/20")} />
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest gap-2">
                    <ArrowLeft size={14} /> Re-evaluate Mission
                  </Button>
                </motion.div>
              )}

              {/* STEP 3: COMFORT */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">Select Comfort Protocol</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COMFORT_LEVELS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setAnswers({...answers, comfort: c.id}); nextStep(); }}
                        className={cn(
                          "executive-card p-10 text-center space-y-4 group",
                          answers.comfort === c.id ? "border-primary bg-primary/5 scale-105" : "hover:border-primary/20"
                        )}
                      >
                        <span className="text-6xl block mb-4">{c.emoji}</span>
                        <h3 className="text-sm font-black uppercase">{c.label}</h3>
                        <p className="text-[9px] text-muted-foreground italic font-medium leading-relaxed">"{c.desc}"</p>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest gap-2">
                    <ArrowLeft size={14} /> Back to Capacity
                  </Button>
                </motion.div>
              )}

              {/* STEP 4: SPECIAL NEEDS */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tight text-center">Operational Requirements</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {SPECIAL_NEEDS.map(n => (
                      <button
                        key={n.id}
                        onClick={() => toggleNeed(n.id)}
                        className={cn(
                          "executive-card p-6 flex items-center gap-6 group transition-all",
                          answers.needs.includes(n.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center border transition-all",
                          answers.needs.includes(n.id) ? "bg-primary text-white border-primary" : "bg-muted border-border text-muted-foreground"
                        )}>
                          <n.icon size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-left">{n.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-white/5">
                    <Button variant="ghost" onClick={prevStep} className="font-black uppercase text-[10px] tracking-widest">
                      <ArrowLeft size={14} className="mr-2" /> Back
                    </Button>
                    <Button onClick={nextStep} className="h-16 px-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl gap-3 group">
                      Finalize Recommendations <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: RESULTS */}
              {step === 5 && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Your Optimized Fleet Nodes</h2>
                    <p className="text-muted-foreground text-sm">Based on your mission profile, these assets are the top performers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                      [1,2,3].map(i => <div key={i} className="h-[400px] bg-muted animate-pulse rounded-[2.5rem]" />)
                    ) : recommendations.map((car: any, i) => (
                      <motion.div
                        key={car.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="executive-card overflow-hidden group"
                      >
                        <div className="relative aspect-[16/10] bg-muted border-b border-border overflow-hidden">
                          <Image src={car.images?.[0] || ""} alt={car.model} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-4 left-4 z-10">
                            <div className="bg-primary text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-2xl">
                              {car.score}% Mission Match
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-black uppercase tracking-tight leading-none">{car.make} {car.model}</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-2">{car.category} • {car.seats} PAX</p>
                          </div>
                          <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div>
                               <p className="text-[8px] font-black uppercase text-primary tracking-widest">Rate / Day</p>
                               <p className="text-xl font-black tracking-tighter">TSh {car.pricePerDay?.toLocaleString()}</p>
                            </div>
                            <Link href={`/cars/${car.id}`}>
                              <Button className="h-10 px-6 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">Reserve</Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="text-center pt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="rounded-2xl h-14 px-10 border-border text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:bg-muted"
                    >
                      Reset Intelligence Node
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}

