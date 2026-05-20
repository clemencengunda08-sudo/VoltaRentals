'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { THEMES, ThemeColors, ThemeId, DEFAULT_THEME } from '@/lib/themes';
import { applyTheme, getStoredThemeId } from '@/lib/apply-theme';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

interface ThemeDataContextType {
  currentThemeId: string;
  currentTheme: ThemeColors;
  isLoading: boolean;
}

interface ThemeActionsContextType {
  setTheme: (themeId: string) => Promise<void>;
}

const ThemeDataContext = createContext<ThemeDataContextType | undefined>(undefined);
const ThemeActionsContext = createContext<ThemeActionsContextType | undefined>(undefined);

/**
 * Theme Context Terminal.
 * Ensures the selected theme is applied across all devices and stays persistent.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(getStoredThemeId());
  const [isLoading, setIsLoading] = useState(true);
  const db = useFirestore();
  const { user } = useUser();

  const currentTheme = THEMES[currentThemeId] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    // 1. Force apply stored theme on mount
    applyTheme(currentTheme);

    // 2. Continuous Sync with Firestore Registry
    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.activeTheme && THEMES[data.activeTheme]) {
          setCurrentThemeId(data.activeTheme);
          applyTheme(THEMES[data.activeTheme]);
          localStorage.setItem('volta-theme', data.activeTheme);
        }
      }
      setIsLoading(false);
    }, (err) => {
      setIsLoading(false);
    });

    return () => unsub();
  }, [db]);

  const setTheme = useCallback(async (themeId: string) => {
    if (!THEMES[themeId]) return;

    // Optimistic UI update
    setCurrentThemeId(themeId);
    applyTheme(THEMES[themeId]);
    localStorage.setItem('volta-theme', themeId);

    try {
      // Commit to cloud registry
      await setDoc(doc(db, 'settings', 'branding'), {
        activeTheme: themeId,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'system'
      }, { merge: true });
    } catch (e) {
      console.warn('Cloud sync failed, theme locked to local session.');
    }
  }, [db, user?.uid]);

  const dataValue = useMemo(() => ({
    currentThemeId,
    currentTheme,
    isLoading
  }), [currentThemeId, currentTheme, isLoading]);

  const actionsValue = useMemo(() => ({
    setTheme
  }), [setTheme]);

  return (
    <ThemeDataContext.Provider value={dataValue}>
      <ThemeActionsContext.Provider value={actionsValue}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeDataContext.Provider>
  );
}

export function useTheme() {
  const data = useContext(ThemeDataContext);
  const actions = useContext(ThemeActionsContext);
  if (!data || !actions) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return { ...data, ...actions };
}
