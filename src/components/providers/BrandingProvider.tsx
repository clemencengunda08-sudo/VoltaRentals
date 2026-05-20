
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  applyTheme,
  getSavedTheme,
  getSavedMode,
  getSavedFont,
  DEFAULT_THEME,
  DEFAULT_FONT,
  THEMES,
  FONTS,
  type ThemeId,
  type ThemeColors,
  type FontId,
} from "@/lib/themes";
import { Branding } from '@/lib/types';

type BrandingContextType = Branding & {
  themeId: ThemeId;
  theme: ThemeColors;
  fontId: FontId;
  mode: "dark" | "light";
  isLight: boolean;
  isLoading: boolean;
  setThemeId: (id: ThemeId) => void;
  setFontId: (id: FontId) => void;
  toggleMode: () => void;
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const db = useFirestore();
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);
  const [fontId, setFontIdState] = useState<FontId>(DEFAULT_FONT);
  const [mode, setModeState] = useState<"dark" | "light">("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Branding>({
    companyName: "Volta Rentals",
    tagline: "Elite Mobility for the Modern Executive",
    logoUrl: "",
    heroImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
    heroVideoUrl: "",
    suvImageUrl: "",
    sedanImageUrl: "",
    vanImageUrl: "",
    luxuryImageUrl: "",
    aboutImageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070&auto=format&fit=crop",
    precisionImageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop",
    experienceMediaUrl: "",
    experienceMediaType: "image",
    activeTheme: DEFAULT_THEME,
    activeFont: DEFAULT_FONT,
    whatsappNumber: "+255 700 000 000",
    supportEmail: "info@voltarentals.co.tz",
    officeAddress: "Mikocheni Area, Dar es Salaam",
    lipaNamba: "12345678",
    stats: {
      deployed: 500,
      missions: 2800,
      satisfaction: 98,
      cities: 7
    },
    marqueeItems: [
      { label: "Toyota Land Cruiser", tag: "SUV", plate: "T 123 EHB" },
      { label: "Mercedes-Benz S-Class", tag: "LUXURY", plate: "T 456 EXZ" },
      { label: "Toyota HiAce", tag: "VAN", plate: "T 789 ELM" },
      { label: "BMW 7 Series", tag: "SEDAN", plate: "T 321 EKJ" },
      { label: "Range Rover Sport", tag: "SUV", plate: "T 654 EHQ" },
      { label: "Toyota Alphard", tag: "VAN", plate: "T 987 EYU" },
      { label: "Lexus LX 570", tag: "LUXURY", plate: "T 147 EPD" },
      { label: "Mercedes GLE", tag: "SUV", plate: "T 258 ETR" },
    ],
    updatedAt: null,
    updatedBy: "system"
  });

  const updateTheme = useCallback((newThemeId: ThemeId, newMode: "dark" | "light", newFontId: FontId) => {
    document.documentElement.classList.add('theme-switching');
    applyTheme(newThemeId, newMode, newFontId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('theme-switching');
      });
    });
  }, []);

  useEffect(() => {
    const savedTheme = getSavedTheme();
    const savedMode = getSavedMode();
    const savedFont = getSavedFont();
    setThemeIdState(savedTheme);
    setModeState(savedMode);
    setFontIdState(savedFont);
    applyTheme(savedTheme, savedMode, savedFont);

    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Branding;
        setSettings(prev => ({ ...prev, ...data }));
        
        let t = themeId;
        let f = fontId;
        
        if (data.activeTheme && THEMES[data.activeTheme as ThemeId]) {
          t = data.activeTheme as ThemeId;
          setThemeIdState(t);
        }
        if (data.activeFont && FONTS[data.activeFont as FontId]) {
          f = data.activeFont as FontId;
          setFontIdState(f);
        }
        updateTheme(t, mode, f);
        
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.faviconUrl;
        }
      }
      setIsLoading(false);
    }, () => setIsLoading(false));

    return () => unsub();
  }, [db, mode, updateTheme]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    updateTheme(id, mode, fontId);
  }, [mode, fontId, updateTheme]);

  const setFontId = useCallback((id: FontId) => {
    setFontIdState(id);
    updateTheme(themeId, mode, id);
  }, [mode, themeId, updateTheme]);

  const toggleMode = useCallback(() => {
    const newMode = mode === "dark" ? "light" : "dark";
    setModeState(newMode);
    updateTheme(themeId, newMode, fontId);
  }, [mode, themeId, fontId, updateTheme]);

  return (
    <BrandingContext.Provider value={{
      ...settings,
      themeId,
      theme: THEMES[themeId],
      fontId,
      mode,
      isLight: mode === "light",
      isLoading,
      setThemeId,
      setFontId,
      toggleMode,
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) throw new Error("useBranding must be used within BrandingProvider");
  return context;
};
