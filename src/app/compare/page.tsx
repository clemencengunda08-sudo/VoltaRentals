'use client';

import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Minus, 
  ArrowLeft, 
  GitCompare,
  Car as CarIcon,
  X,
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COMPARE_ROWS = [
  { key: "category",         label: "Classification",    type: "text"     },
  { key: "pricePerDay",      label: "Daily Reserve",     type: "price"    },
  { key: "withDriverCostPerDay", label: "Chauffeur Node", type: "price"    },
  { key: "seats",            label: "Capacity (PAX)",    type: "number"   },
  { key: "transmission",     label: "Gearbox Protocol",  type: "text"     },
  { key: "fuelType",         label: "Energy Type",       type: "text"     },
  { key: "year",             label: "Registry Year",     type: "number"   },
  { key: "location",         label: "Primary Hub",       type: "text"     },
  { key: "available",        label: "Registry Status",   type: "boolean"  },
];

function CellValue({ 
  value, 
  type,
  isBest,
}: { 
  value: any;
  type: string;
  isBest?: boolean;
}) {
  if (value === undefined || value === null) {
    return <Minus size={14} className="text-muted-foreground/20 mx-auto" />;
  }

  if (type === "boolean") {
    return value 
      ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto" />
      : <XCircle size={18} className="text-red-500/30 mx-auto" />;
  }

  if (type === "price") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={cn(
          "text-sm font-black",
          isBest ? "text-emerald-500" : "text-foreground"
        )}>
          TSh {Number(value).toLocaleString()}
        </span>
        {isBest && (
          <span className="text-[7px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
            Optimal Value
          </span>
        )}
      </div>
    );
  }

  return (
    <span className={cn(
      "text-sm font-black uppercase tracking-tight",
      isBest ? "text-primary" : "text-foreground/80"
    )}>
      {value}
    </span>
  );
}

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (compareList.length < 2) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-sm"
        >
          <div className="h-24 w-24 rounded-[2.5rem] bg-card border border-border flex items-center justify-center mx-auto shadow-2xl relative">
            <GitCompare size={40} className="text-primary/20" />
            <div className="absolute inset-0 border border-primary/10 rounded-[2.5rem] animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Registry Empty</h1>
            <p className="text-muted-foreground text-sm font-medium italic">
              "You must select at least two assets to initialize the comparison terminal."
            </p>
          </div>
          <Button asChild className="h-14 px-10 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
            <Link href="/fleet"><ArrowLeft size={16} className="mr-2" /> Open Fleet Registry</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      
      {/* TERMINAL HEADER */}
      <div className="border-b border-border bg-card/60 backdrop-blur-2xl sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="h-6 w-px bg-border/50" />
            <div className="space-y-0.5">
              <h1 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">Comparison Terminal</h1>
              <p className="text-[8px] font-black uppercase text-primary tracking-[0.3em]">Fleet Node Audit: {compareList.length} Units</p>
            </div>
          </div>
          <button
            onClick={() => { clearCompare(); router.push("/fleet"); }}
            className="h-10 px-6 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg"
          >
            Clear Archive
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        
        {/* ASSET CARDS ROW */}
        <div className="overflow-x-auto no-scrollbar pb-6 w-full -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid gap-6 min-w-max"
            style={{ 
              gridTemplateColumns: `minmax(180px, 240px) repeat(${compareList.length}, 1fr)` 
            }}
          >
          {/* Legend Column Placeholder */}
          <div className="flex flex-col justify-end pb-8">
             <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 space-y-3">
                <Zap className="text-primary h-5 w-5 fill-current" />
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Strategic Insight</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">"Compare specifications side-by-side to ensure mission alignment."</p>
             </div>
          </div>
          
          {/* Car Unit Cards */}
          <AnimatePresence>
            {compareList.map((car, i) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="executive-card relative group"
              >
                <button
                  onClick={() => removeFromCompare(car.id)}
                  className="absolute top-4 right-4 z-20 h-8 w-8 rounded-xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-red-600 transition-all shadow-xl"
                >
                  <X size={14} />
                </button>

                <div className="aspect-[16/10] relative bg-muted border-b border-border overflow-hidden">
                  {car.images?.[0] ? (
                    <Image src={car.images[0]} alt={car.model} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><CarIcon size={40} className="text-muted-foreground/10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2">{car.category}</p>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-foreground leading-none">{car.make} <br/> {car.model}</h3>
                  
                  <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
                    <Link href={`/cars/${car.id}`} className="flex-1">
                      <Button className="w-full h-11 bg-primary text-white font-black uppercase text-[10px] tracking-widest shadow-xl rounded-xl group">
                        Book Now <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

        {/* DATA MATRIX TABLE */}
        <div className="bg-card border border-border rounded-[3rem] shadow-3xl overflow-x-auto no-scrollbar">
          <div className="min-w-max">
          {/* Table Rows */}
          {COMPARE_ROWS.map((row, rowIndex) => {
            const values = compareList.map(car => car[row.key as keyof typeof car]);
            
            // Intelligence: Find optimal value (lowest for price)
            let bestIndex = -1;
            if (row.type === "price") {
              const nums = values.map(v => Number(v) || Infinity);
              bestIndex = nums.indexOf(Math.min(...nums));
            }

            return (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className={cn(
                  "grid border-b border-border/40 last:border-0",
                  rowIndex % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                )}
                style={{ 
                  gridTemplateColumns: `minmax(180px, 240px) repeat(${compareList.length}, 1fr)` 
                }}
              >
                {/* Field Identifier */}
                <div className="p-6 flex items-center border-r border-border/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {row.label}
                  </span>
                </div>

                {/* Metric Payload */}
                {values.map((value, colIndex) => (
                  <div
                    key={colIndex}
                    className="p-6 flex items-center justify-center border-r border-border/20 last:border-0"
                  >
                    <CellValue
                      value={value}
                      type={row.type}
                      isBest={bestIndex === colIndex}
                    />
                  </div>
                ))}
              </motion.div>
            );
          })}
          </div>
        </div>

        {/* AUDIT SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-primary/10 border border-primary/20 rounded-[3rem] p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Zap size={200} />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Executive Audit Winner</p>
            <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground">
              {(() => {
                const sorted = [...compareList].sort((a, b) => a.pricePerDay - b.pricePerDay);
                return `${sorted[0].make} ${sorted[0].model}`;
              })()}
            </h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">
              "This unit offers the most efficient daily reserve rate within your current selection buffer. Optimized for high-value operations."
            </p>
            <div className="pt-4">
               <Link href={`/cars/${[...compareList].sort((a, b) => a.pricePerDay - b.pricePerDay)[0].id}`}>
                  <Button className="h-16 px-12 bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-3xl">Commit to Selection</Button>
               </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
