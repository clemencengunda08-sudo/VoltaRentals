"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WheelPaginationProps {
  totalPages?: number;
  className?: string;
  visibleCount?: number; // Number of pages visible at once
  onChange?: (page: number) => void;
  activePage?: number;
}

export default function WheelPagination({
  totalPages = 1,
  visibleCount = 5,
  className,
  onChange,
  activePage = 0,
}: WheelPaginationProps) {
  const handlePageChange = (page: number) => {
    if (page !== activePage && onChange) {
      onChange(page);
    }
  };

  const prevPage = () => handlePageChange(Math.max(activePage - 1, 0));
  const nextPage = () => handlePageChange(Math.min(activePage + 1, totalPages - 1));


  // Determine visible pages based on active
  const getVisiblePages = () => {
    const pages = [];
    const count = Math.min(visibleCount, totalPages);
    const half = Math.floor(count / 2);
    let start = activePage - half;
    let end = activePage + half;

    if (start < 0) {
      end += -start;
      start = 0;
    }
    if (end > totalPages - 1) {
      start -= end - (totalPages - 1);
      end = totalPages - 1;
      if (start < 0) start = 0;
    }

    for (let i = start; i <= end; i++) {
      if (i >= 0 && i < totalPages) {
        pages.push(i);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 p-4 select-none",
        className
      )}
    >
      {/* Previous arrow */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevPage}
        disabled={activePage === 0}
        className="text-muted-foreground hover:text-primary disabled:opacity-20 transition-all rounded-xl"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
 
      {/* Page numbers carousel */}
      <div className="flex gap-3">
        {visiblePages.map((p) => (
          <motion.div
            key={p}
            layout
            animate={{ scale: activePage === p ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full font-black text-[10px] cursor-pointer transition-all",
              activePage === p
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            onClick={() => handlePageChange(p)}
          >
            {p + 1}
          </motion.div>
        ))}
      </div>
 
      {/* Next arrow */}
      <Button
        variant="ghost"
        size="icon"
        onClick={nextPage}
        disabled={activePage === totalPages - 1}
        className="text-muted-foreground hover:text-primary disabled:opacity-20 transition-all rounded-xl"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
