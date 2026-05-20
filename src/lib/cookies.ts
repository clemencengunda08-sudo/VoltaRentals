'use client';

/**
 * @fileOverview Cookie consent management utility for VoltaRentals.
 * Handles storage and retrieval of user privacy preferences.
 */

export interface CookiePreferences {
  necessary: true; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: string;
}

const STORAGE_KEY = "volta_cookie_consent";

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

export function setCookieConsent(prefs: Partial<CookiePreferences>): void {
  if (typeof window === 'undefined') return;
  const data: CookiePreferences = {
    necessary: true,
    analytics: prefs.analytics ?? false,
    marketing: prefs.marketing ?? false,
    functional: prefs.functional ?? true,
    timestamp: Date.now(),
    version: "1.0"
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function hasConsented(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function acceptAllCookies(): void {
  setCookieConsent({
    analytics: true,
    marketing: true,
    functional: true
  });
}

export function rejectOptionalCookies(): void {
  setCookieConsent({
    analytics: false,
    marketing: false,
    functional: true
  });
}

export function revokeConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCookieAge(): number {
  const prefs = getCookieConsent();
  if (!prefs) return -1;
  const diff = Date.now() - prefs.timestamp;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
