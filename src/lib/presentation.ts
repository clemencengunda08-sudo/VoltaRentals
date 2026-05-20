'use client';

/**
 * @fileOverview Presentation Mode Utility.
 * Manages the state for elite investor demonstrations.
 */

export function isPresentationMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('volta_presentation_mode') === 'true';
}

export function enablePresentationMode(): void {
  localStorage.setItem('volta_presentation_mode', 'true');
  localStorage.setItem('volta_demo_mode', 'true');
}

export function disablePresentationMode(): void {
  localStorage.removeItem('volta_presentation_mode');
}

export function formatPresentationPrice(amount: number): string {
  if (!isPresentationMode()) return amount.toLocaleString();
  // Round to nearest 10k for cleaner demo visuals
  return (Math.round(amount / 10000) * 10000).toLocaleString();
}
