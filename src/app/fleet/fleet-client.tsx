'use client';

import { useState, useMemo, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { 
  LayoutGrid, 
  LayoutList, 
  Search, 
  Filter,
  Car as CarIcon,
  ChevronDown,
  ShieldCheck,
  Share2
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import CarCard from "@/components/fleet/car-card";
import { FleetHero } from "@/components/fleet/fleet-hero";
import { cn } from "@/lib/utils";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/AnimatedSection";
import WheelPagination from "@/components/ui/wheel-pagination";
import { CarCardSkeleton } from "@/components/ui/CarCardSkeleton";
import { ShareButton } from "@/components/sharing/ShareButton";
import { CompareDrawer } from "@/components/fleet/compare-drawer";

// ── Constants ────────────────────────────────────────────────
const CATEGORIES = ["All", "SUV", "Sedan", "Van", "Luxury", "Bus", "Pickup"];
const SORTS = [
  { label: "Recently Added",    value: "newest"     },
  { label: "Price: Low to High",value: "price-asc"  },
  { label: "Price: High to Low",value: "price-desc" },
];
const CARS_PER_PAGE = 9;

// ── Component ────────────────────────────────────────────────
export function FleetClient() {
  const db = useFirestore();

  // ── State ──────────────────────────────────────────────────
  const [searchTerm,     setSearchTerm]     = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder,      setSortOrder]      = useState("newest");
  const [viewMode,       setViewMode]       = useState<"grid" | "list">("grid");
  const [currentPage,    setCurrentPage]    = useState(0);

  // FIX: ref to scroll target — no more hardcoded 400px
  const gridRef = useRef<HTMLDivElement>(null);

  // FIX: Stable scroll detection — removed jitter-prone buffer
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastYRef.current;
    lastYRef.current = latest;

    if (latest < 80) {
      setScrolled(false);
      return;
    }
    // Only update if moved more than 5px to prevent micro-jitter
    if (Math.abs(latest - prev) > 5) {
      setScrolled(latest > prev); // true = scrolling down
    }
  });

  // ── Firebase ───────────────────────────────────────────────
  const carsQuery = useMemoFirebase(() => {
    return query(collection(db, "cars"), limit(200));
  }, [db]);

  const { data: rawCars, loading } = useCollection(carsQuery);

  // ── Filter + Sort ──────────────────────────────────────────
  const filteredCars = useMemo(() => {
    if (!rawCars || rawCars.length === 0) return [];

    let result = rawCars.filter(car => {
      if (car.available === false) return false;
      
      // Filter out vehicles whose LATRA or Insurance is expired (Day 0 approach)
      if (car.latraExpiry && differenceInDays(new Date(car.latraExpiry), new Date()) < 0) return false;
      if (car.insuranceExpiry && differenceInDays(new Date(car.insuranceExpiry), new Date()) < 0) return false;
      
      return true;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(car =>
        (car.make?.toLowerCase() || "").includes(term)        ||
        (car.model?.toLowerCase() || "").includes(term)       ||
        (car.plateNumber?.toLowerCase() || "").includes(term)
      );
    }

    if (activeCategory !== "All") {
      result = result.filter(car => car.category === activeCategory);
    }

    // Sort Protocols
    if (sortOrder === "price-asc") {
      result.sort((a, b) => (Number(a.pricePerDay) || 0) - (Number(b.pricePerDay) || 0));
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => (Number(b.pricePerDay) || 0) - (Number(a.pricePerDay) || 0));
    } else if (sortOrder === "newest") {
      result.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const dateB = b.createdAt?.toDate?.()?.getTime() || (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return dateB - dateA;
      });
    }

    return result;
  }, [rawCars, searchTerm, activeCategory, sortOrder]);

  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);

  const displayedCars = useMemo(() => {
    const start = currentPage * CARS_PER_PAGE;
    return filteredCars.slice(start, start + CARS_PER_PAGE);
  }, [filteredCars, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleSortChange = (val: string) => {
    setSortOrder(val);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveCategory("All");
    setCurrentPage(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 bg-background pt-14">
        <FleetHero />

        {/* ── STICKY FILTER NAV ── */}
        <motion.div
          initial={false}
          animate={{
            opacity: 1,
            boxShadow: scrolled
              ? "0 4px 24px rgba(0,0,0,0.18)"
              : "0 1px 4px rgba(0,0,0,0.06)",
          }}
          transition={{ duration: 0.3 }}
          className="sticky top-[64px] z-40 w-full bg-card/95 backdrop-blur-md border-b border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">

            {/* Search + View toggle */}
            <div className="flex items-center gap-2 w-full lg:flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Registry search..."
                  className="h-10 pl-9 rounded-xl bg-muted border-none text-foreground font-bold text-xs"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl shrink-0">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={14} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList size={14} />
                </Button>
              </div>
            </div>

            {/* Category filters + Sort */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black",
                    "uppercase tracking-widest whitespace-nowrap",
                    "transition-all duration-200 border shrink-0",
                    activeCategory === cat
                      ? "bg-primary text-white border-primary shadow-lg"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-border"
                  )}
                >
                  {cat}
                </button>
              ))}

              <div className="lg:ml-4 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 px-3 rounded-lg border-border bg-muted text-foreground font-black uppercase text-[9px] tracking-widest gap-2"
                    >
                      <Filter className="h-3 w-3 text-primary" />
                      <span className="hidden sm:inline">
                        {SORTS.find(s => s.value === sortOrder)?.label}
                      </span>
                      <ChevronDown size={10} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl w-48 p-1 bg-card border-border"
                  >
                    {SORTS.map((s) => (
                      <DropdownMenuItem
                        key={s.value}
                        onClick={() => handleSortChange(s.value)}
                        className="rounded-lg h-9 font-bold uppercase text-[9px] tracking-widest cursor-pointer"
                      >
                        {s.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <div
          ref={gridRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 min-h-screen scroll-mt-32"
        >
          {/* Results header */}
          <AnimatedSection
            direction="down"
            delay={0.1}
            className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6"
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">
                  Elite Collection
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-2">
                  Registry Buffer: {filteredCars.length} Verified Units
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ShareButton 
                  shareType="fleet" 
                  data={filteredCars} 
                  variant="button" 
                  size="sm" 
                  className="hidden md:flex"
                />
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground">
                    Insured Node
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── LOADING ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>

          /* ── EMPTY STATE ── */
          ) : filteredCars.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-40 text-center space-y-8"
            >
              <div className="h-24 w-24 rounded-[2rem] bg-card border border-border flex items-center justify-center text-muted-foreground/30">
                <CarIcon size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
                  No Assets Found
                </h3>
                <p className="text-muted-foreground font-medium mt-2">
                  Adjust criteria or contact concierge for custom requests.
                </p>
              </div>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest text-foreground"
              >
                Clear Filters
              </Button>
            </motion.div>

          /* ── CAR GRID ── */
          ) : (
            <>
              <StaggerContainer
                className={cn(
                  "grid gap-6 md:gap-8",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
                staggerDelay={0.07}
              >
                <AnimatePresence mode="popLayout">
                  {displayedCars.map((car, index) => (
                    <StaggerItem key={car.id} direction="up">
                      <motion.div
                        whileHover={{
                          y: -6,
                          transition: { duration: 0.25 },
                        }}
                      >
                        <CarCard
                          car={car}
                          index={index}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    </StaggerItem>
                  ))}
                </AnimatePresence>
              </StaggerContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center border-t border-border/50 pt-10">
                  <WheelPagination
                    totalPages={totalPages}
                    visibleCount={5}
                    activePage={currentPage}
                    onChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <CompareDrawer />
    </div>
  );
}
