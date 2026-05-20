'use client';
import { useEffect, useState } from 'react';

/**
 * Ultra-Precision ambient cursor glow for desktop users.
 * Reduced to 180px for a more "High-End" surgical feel.
 */
export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (window.innerWidth < 768) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const hide = () => setVisible(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', hide);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', hide);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div
      className='pointer-events-none fixed z-[120] rounded-full'
      style={{
        width: '180px', // Reduced for micro-precision
        height: '180px',
        left: pos.x - 90,
        top: pos.y - 90,
        background:
          'radial-gradient(circle, hsla(0, 72%, 42%, 0.1) 0%, transparent 80%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        transform: 'translateZ(0)',
      }}
    />
  );
}
