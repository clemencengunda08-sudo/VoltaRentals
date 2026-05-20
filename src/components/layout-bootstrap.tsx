
'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';

const CookieConsentBanner = dynamic(() => import('@/components/cookies/CookieConsentBanner'), { ssr: false });
const PWAInstallPrompt = dynamic(() => import('@/components/pwa/PWAInstallPrompt').then(mod => mod.PWAInstallPrompt), { ssr: false });
const PWAUpdateNotification = dynamic(() => import('@/components/pwa/PWAUpdateNotification').then(mod => mod.PWAUpdateNotification), { ssr: false });
const QuickContactFab = dynamic(() => import('@/components/ui/QuickContactFab').then(mod => mod.QuickContactFab), { ssr: false });

/**
 * Handles client-side initialization for the root layout.
 * Manages the static splash screen removal.
 */
export function LayoutBootstrap() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Snappy fade out for the static splash (Low duration for better UX)
    const loader = document.getElementById('initial-global-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 100); // Ultra-fast cleanup
      }, 10); // Start fade-out immediately
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div 
        className="cursor-glow hidden md:block" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />
      <QuickContactFab />
      <CookieConsentBanner />
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </>
  );
}
