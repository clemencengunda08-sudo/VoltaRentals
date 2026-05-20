'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { enablePresentationMode, disablePresentationMode, isPresentationMode } from '@/lib/presentation';

/**
 * Global Keyboard Shortcuts for Admin Demonstration.
 * Ctrl+Shift+P: Toggle Presentation Mode
 * Ctrl+Shift+D: Toggle Demo Mode
 */
export function DemoShortcuts() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key === 'P') {
          e.preventDefault();
          if (isPresentationMode()) {
            disablePresentationMode();
            toast({ title: "Presentation Mode Disabled" });
          } else {
            enablePresentationMode();
            toast({ title: "Presentation Mode Enabled 🎬" });
          }
          window.location.reload();
        }
        
        if (e.key === 'D') {
          e.preventDefault();
          const isDemo = localStorage.getItem('volta_demo_mode') === 'true';
          localStorage.setItem('volta_demo_mode', isDemo ? 'false' : 'true');
          toast({ title: isDemo ? "Demo Mode Disabled" : "Demo Mode Active ⚡" });
          window.location.reload();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  return null;
}
