
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '@/components/providers/BrandingProvider';

/**
 * Supreme Splash Screen Node.
 * High-priority visual blocker that ensures zero content flicker on mount.
 * Optimized for SUPER SPEED (Snappy Exit Protocol).
 * Guaranteed removal via multiple safety triggers.
 */
export function VoltaSplash() {
  const { companyName, themeColor, faviconUrl } = useBranding();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dismissedRef = useRef(false);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── THE DISMISS PROTOCOL ──
  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;

    // Cleanup timers
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // Update state and persistence
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('volta_splash_seen', 'true');
    }
  }, []);

  // ── HOOK 1: SESSION GUARD ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenSplash = sessionStorage.getItem('volta_splash_seen');
      if (hasSeenSplash) {
        dismiss();
      }
    }
  }, [dismiss]);

  // ── HOOK 2: CANVAS PARTICLES (Isolated) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: any[] = [];
    const colors = [themeColor || '#cc0000', '#ff4444', '#ff6666', '#aa0000'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [themeColor]);

  // ── HOOK 3: PROGRESS & SAFETY TIMERS ──
  useEffect(() => {
    // 1. Hard Timeout Safety (2.5 seconds max)
    safetyTimerRef.current = setTimeout(dismiss, 1000);

    // 2. High-Velocity Progress Interval
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setTimeout(dismiss, 0); // Snappy exit after reaching 100%
          return 100;
        }
        // Random 25-40 increment for maximum speed
        return prev + Math.floor(Math.random() * 20 + 50);
      });
    }, 60);

    // 3. Window Load Trigger
    const handleLoad = () => {
      // If page is fully ready before timers, let's go
      setTimeout(dismiss, 500); 
    };
    window.addEventListener('load', handleLoad);

    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      window.removeEventListener('load', handleLoad);
    };
  }, [dismiss]);

  const brandName = companyName || "Volta Rentals";
  const firstName = brandName.split(' ')[0].toUpperCase();
  const restName = brandName.split(' ').slice(1).join(' ') || "Rentals";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ 
            pointerEvents: progress > 80 ? 'none' : 'auto' 
          }}
          className="fixed inset-0 z-[999999] bg-[#0a0a1a] flex flex-col items-center justify-center overflow-hidden"
        >
          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

          {/* Glow Ring */}
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[300px] h-[300px] rounded-full z-1"
            style={{ 
              background: `radial-gradient(circle, ${themeColor || '#cc0000'}33 0%, transparent 70%)` 
            }}
          />

          {/* Logo Area */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mb-8"
          >
            {faviconUrl ? (
              <img 
                src={faviconUrl} 
                className="w-24 h-24 object-contain" 
                style={{ filter: `drop-shadow(0 8px 25px ${themeColor || '#cc0000'}88)` }}
                alt="Logo"
              />
            ) : (
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
                 style={{ filter: `drop-shadow(0 8px 25px ${themeColor || '#cc0000'}88)` }}>
                <defs>
                    <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#dd0000' }}/>
                        <stop offset="100%" style={{ stopColor: '#7a0000' }}/>
                    </linearGradient>
                </defs>
                <rect width="100" height="100" rx="22" fill="url(#splashBg)"/>
                <path d="M15 22 L50 72 L85 22 L74 22 L50 60 L26 22 Z" fill="white" opacity="0.9"/>
                <path d="M56 16 L40 48 L50 48 L44 80 L65 42 L54 42 Z" fill="white"/>
              </svg>
            )}
          </motion.div>

          {/* Brand Text */}
          <div className="relative z-10 text-center space-y-2">
            <h1 className="text-4xl font-black tracking-[0.2em] text-white uppercase leading-none">
              {firstName}
            </h1>
            <p className="text-sm font-bold tracking-[0.4em] text-gray-500 uppercase">
              {restName}
            </p>
          </div>

          {/* Loading Bar */}
          <div className="relative z-10 w-44 h-[2px] bg-white/10 rounded-full mt-12 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
