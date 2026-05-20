import { ThemeColors, DEFAULT_THEME, THEMES } from './themes';

/**
 * Applies the selected theme's color tokens to the document root.
 * Directly maps HSL values to CSS variables used by Tailwind.
 */
export function applyTheme(theme: ThemeColors) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Set the base HSL values for Tailwind variables
  // We use setProperty to override the globals.css defaults
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  
  // These affect Dark Mode specifically
  root.style.setProperty('--background', theme.darkBg);
  root.style.setProperty('--card', theme.darkCard);
  root.style.setProperty('--popover', theme.darkCard);
  root.style.setProperty('--muted', theme.darkCard);
  
  // Set border color slightly lighter than card for depth in dark mode
  root.style.setProperty('--border', '0 0% 15%');

  // Persistence
  root.setAttribute('data-theme', theme.id);
  localStorage.setItem('volta-theme', theme.id);
}

/**
 * Retrieves the currently saved theme ID from localStorage.
 */
export function getStoredThemeId(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  return localStorage.getItem('volta-theme') || DEFAULT_THEME;
}
