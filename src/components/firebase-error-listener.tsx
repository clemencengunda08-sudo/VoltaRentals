'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A central listener component that catches Firestore permission errors.
 * MODIFIED: Non-crashing protocol for demo phase. Logs instead of throwing.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error: FirestorePermissionError) => {
      // Non-crashing strategy: 
      // Log with elite context, but allow UI to continue with local cache.
      console.error("🔥 VOLTA REGISTRY AUTH ERROR:", {
        message: error.message,
        path: error.path,
        operation: error.operation,
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
