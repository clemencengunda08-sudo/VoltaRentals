import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates an official VoltaRentals booking code.
 * Format: VLT-[4 chars]-[current year]
 */
export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'VLT-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  code += '-' + new Date().getFullYear()
  return code
}

/**
 * Sanitizes data for Firestore by removing undefined values.
 */
export function sanitizeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (key, value) => 
    value === undefined ? null : value
  ));
}

/**
 * Optimizes external image URLs for Cloudinary and Unsplash.
 */
export function optimizeImageUrl(url: string | null | undefined, width: number = 1200, quality: number = 80): string | null {
  if (!url) return null;
  
  try {
    // Cloudinary Optimization
    if (url.includes('cloudinary.com')) {
      // Find the /upload/ part and insert transformation parameters
      if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/f_auto,q_${quality === 80 ? 'auto' : quality},w_${width}/`);
      }
    }
    
    // Unsplash Optimization
    if (url.includes('unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      // Remove existing width if present to avoid conflicts
      const cleanUrl = url.split('&w=')[0].split('?w=')[0];
      return `${cleanUrl}${separator}auto=format&fit=crop&q=${quality}&w=${width}`;
    }
  } catch (e) {
    console.warn("Image optimization failed for URL:", url);
  }

  return url;
}
