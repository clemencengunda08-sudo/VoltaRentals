/**
 * @fileOverview VoltaRentals Executive Theme Registry
 * Each theme has BOTH dark and light surface tokens.
 */

export type ThemeColors = {
  id: string;
  name: string;
  emoji: string;
  primary: string;    // HSL
  secondary: string;  // HSL
  accent: string;     // HSL
  darkBg: string;
  darkCard: string;
  darkPopover: string;
  darkMuted: string;
  darkMutedForeground: string;
  darkBorder: string;
  darkForeground: string;
  lightBg: string;
  lightCard: string;
  lightPopover: string;
  lightMuted: string;
  lightMutedForeground: string;
  lightBorder: string;
  lightForeground: string;
  preview: string;
  previewBg: string;
  previewAccent: string;
};

export const THEMES: Record<string, ThemeColors> = {
  volta_red: {
    id: "volta_red",
    name: "Volta Red",
    emoji: "🔴",
    primary: "0 72% 42%",
    secondary: "38 92% 50%",
    accent: "161 84% 42%",
    darkBg: "222 47% 4%",
    darkCard: "222 47% 6%",
    darkPopover: "222 47% 5%",
    darkMuted: "222 47% 8%",
    darkMutedForeground: "215 20% 65%",
    darkBorder: "222 47% 10%",
    darkForeground: "210 20% 98%",
    lightBg: "0 0% 97%",
    lightCard: "0 0% 100%",
    lightPopover: "0 0% 100%",
    lightMuted: "0 5% 93%",
    lightMutedForeground: "0 5% 40%",
    lightBorder: "0 5% 87%",
    lightForeground: "222 47% 8%",
    preview: "#B91C1C",
    previewBg: "#070D1A",
    previewAccent: "#F59E0B",
  },
  emerald_racing: {
    id: "emerald_racing",
    name: "Emerald Racing",
    emoji: "🏎️",
    primary: "142 71% 35%",
    secondary: "45 93% 47%",
    accent: "142 71% 45%",
    darkBg: "150 30% 4%",
    darkCard: "150 25% 7%",
    darkPopover: "150 25% 6%",
    darkMuted: "150 20% 10%",
    darkMutedForeground: "150 10% 55%",
    darkBorder: "150 20% 13%",
    darkForeground: "150 10% 97%",
    lightBg: "150 20% 97%",
    lightCard: "150 15% 100%",
    lightPopover: "150 15% 100%",
    lightMuted: "150 15% 92%",
    lightMutedForeground: "150 8% 42%",
    lightBorder: "150 10% 86%",
    lightForeground: "150 30% 8%",
    preview: "#15803d",
    previewBg: "#06130b",
    previewAccent: "#eab308",
  },
  carbon_gold: {
    id: "carbon_gold",
    name: "Carbon Gold",
    emoji: "⚫",
    primary: "45 93% 47%",
    secondary: "0 0% 95%",
    accent: "45 93% 60%",
    darkBg: "0 0% 4%",
    darkCard: "0 0% 7%",
    darkPopover: "0 0% 5%",
    darkMuted: "0 0% 10%",
    darkMutedForeground: "0 0% 55%",
    darkBorder: "0 0% 13%",
    darkForeground: "0 0% 97%",
    lightBg: "45 20% 97%",
    lightCard: "45 15% 100%",
    lightPopover: "45 15% 100%",
    lightMuted: "45 15% 93%",
    lightMutedForeground: "45 8% 40%",
    lightBorder: "45 10% 86%",
    lightForeground: "0 0% 8%",
    preview: "#EAB308",
    previewBg: "#0A0A0A",
    previewAccent: "#FAFAFA",
  },
  electric_blue: {
    id: "electric_blue",
    name: "Electric Blue",
    emoji: "🔵",
    primary: "217 91% 50%",
    secondary: "199 89% 48%",
    accent: "199 89% 55%",
    darkBg: "224 50% 5%",
    darkCard: "222 47% 8%",
    darkPopover: "222 47% 6%",
    darkMuted: "222 40% 11%",
    darkMutedForeground: "215 20% 60%",
    darkBorder: "222 40% 13%",
    darkForeground: "210 20% 98%",
    lightBg: "220 30% 97%",
    lightCard: "220 20% 100%",
    lightPopover: "220 20% 100%",
    lightMuted: "220 20% 93%",
    lightMutedForeground: "220 10% 42%",
    lightBorder: "220 20% 87%",
    lightForeground: "222 47% 8%",
    preview: "#1D6FEB",
    previewBg: "#060C1A",
    previewAccent: "#22D3EE",
  }
};

export type ThemeId = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeId = "volta_red";

export type FontConfig = {
  id: string;
  name: string;
  value: string;
  heading: string;
};

export const FONTS: Record<string, FontConfig> = {
  inter: { id: "inter", name: "Inter (Modern)", value: "'Inter', sans-serif", heading: "'Inter', sans-serif" },
  montserrat: { id: "montserrat", name: "Montserrat (Premium)", value: "'Montserrat', sans-serif", heading: "'Montserrat', sans-serif" },
  syncopate: { id: "syncopate", name: "Syncopate (Tech)", value: "'Inter', sans-serif", heading: "'Syncopate', sans-serif" },
  poppins: { id: "poppins", name: "Poppins (Friendly)", value: "'Poppins', sans-serif", heading: "'Poppins', sans-serif" }
};

export type FontId = keyof typeof FONTS;
export const DEFAULT_FONT: FontId = "inter";

export function getSavedTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  return (localStorage.getItem("volta_theme") as ThemeId) || DEFAULT_THEME;
}

export function getSavedMode(): "dark" | "light" {
  if (typeof window === 'undefined') return "dark";
  return (localStorage.getItem("volta_mode") as "dark" | "light") || "dark";
}

export function getSavedFont(): FontId {
  if (typeof window === 'undefined') return DEFAULT_FONT;
  return (localStorage.getItem("volta_font") as FontId) || DEFAULT_FONT;
}

export function applyTheme(themeId: ThemeId, mode: "dark" | "light", fontId: FontId = DEFAULT_FONT): void {
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const font = FONTS[fontId] || FONTS[DEFAULT_FONT];
  
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--font-body", font.value);
  root.style.setProperty("--font-heading", font.heading);

  if (mode === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-mode", "dark");
    root.style.setProperty("--background", theme.darkBg);
    root.style.setProperty("--foreground", theme.darkForeground);
    root.style.setProperty("--card", theme.darkCard);
    root.style.setProperty("--popover", theme.darkPopover);
    root.style.setProperty("--muted", theme.darkMuted);
    root.style.setProperty("--muted-foreground", theme.darkMutedForeground);
    root.style.setProperty("--border", theme.darkBorder);
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-mode", "light");
    root.style.setProperty("--background", theme.lightBg);
    root.style.setProperty("--foreground", theme.lightForeground);
    root.style.setProperty("--card", theme.lightCard);
    root.style.setProperty("--popover", theme.lightPopover);
    root.style.setProperty("--muted", theme.lightMuted);
    root.style.setProperty("--muted-foreground", theme.lightMutedForeground);
    root.style.setProperty("--border", theme.lightBorder);
  }

  // Save to local storage for persistence across reloads
  if (typeof window !== 'undefined') {
    localStorage.setItem("volta_theme", themeId);
    localStorage.setItem("volta_mode", mode);
    localStorage.setItem("volta_font", fontId);
  }
}
