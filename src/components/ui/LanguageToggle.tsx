"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "sw" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      aria-label={`Switch language to ${language === "en" ? "Kiswahili" : "English"}`}
      className="h-10 px-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center gap-2 transition-all duration-300 shadow-sm"
    >
      <Globe size={14} className="text-muted-foreground animate-[pulse_3s_ease_in_out_infinite]" />
      <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
        {language === "en" ? "EN" : "SW"}
      </span>
    </button>
  );
}
