'use client';

import { m, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
}

export function Lightbox({ isOpen, onClose, images, initialIndex }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
          >
            <X size={24} />
          </button>

          <div className="absolute top-8 left-8 text-white font-black uppercase text-[10px] tracking-[0.4em] opacity-40">
            {index + 1} of {images.length}
          </div>

          <div className="relative w-full max-w-6xl aspect-[16/10] flex items-center justify-center group">
            <button 
              onClick={prev}
              className="absolute left-4 lg:-left-20 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft size={32} />
            </button>

            <m.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="relative w-full h-full"
            >
              <Image 
                src={images[index]} 
                alt={`Image ${index + 1}`} 
                fill 
                className="object-contain" 
              />
            </m.div>

            <button 
              onClick={next}
              className="absolute right-4 lg:-right-20 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="absolute bottom-12 flex gap-3 p-4 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 max-w-full overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-16 w-24 rounded-xl overflow-hidden flex-shrink-0 transition-all",
                  index === i ? "ring-2 ring-secondary ring-offset-2 ring-offset-black scale-110" : "opacity-40 hover:opacity-100"
                )}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}