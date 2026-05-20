"use client";

import { Sun, Moon } from "lucide-react";
import { useBranding } from "@/components/providers/BrandingProvider";

export function ModeToggle() {
  const { mode, toggleMode, isLight } = useBranding();

  return (
    <button
      onClick={toggleMode}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className={`
        relative h-9 w-9 rounded-full border flex items-center justify-center
        transition-all duration-300 group overflow-hidden
        ${isLight
          ? "bg-white border-zinc-200 shadow-sm shadow-black/8 hover:border-primary/50"
          : "bg-card border-border hover:border-primary/40"
        }
      `}
    >
      <Sun
        size={15}
        className={`
          absolute transition-all duration-500 text-muted-foreground 
          group-hover:text-primary
          ${isLight
            ? "opacity-0 rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100"
          }
        `}
      />
      <Moon
        size={15}
        className={`
          absolute transition-all duration-500 text-muted-foreground
          group-hover:text-primary
          ${isLight
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
          }
        `}
      />
    </button>
  );
}
