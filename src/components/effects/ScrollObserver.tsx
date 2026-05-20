'use client';

import { useScrollObserver } from '@/hooks/useScrollObserver';

/**
 * Global Scroll Observer component.
 * Activates IntersectionObserver for performant scroll-entry animations.
 */
export function ScrollObserver() {
  useScrollObserver();
  return null;
}