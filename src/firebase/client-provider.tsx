
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  
  const services = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    setInitialized(true);
  }, []);

  return (
    <FirebaseProvider 
      app={services.app} 
      auth={services.auth} 
      db={services.db}
      storage={services.storage}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
