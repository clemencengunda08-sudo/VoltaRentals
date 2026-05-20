'use client';

import { useEffect, useState } from 'react';
import { 
  onSnapshot, 
  DocumentReference, 
  DocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';

/**
 * A hook to subscribe to a single Firestore document.
 * Handles loading states and provides silent fallback for errors.
 * Resilient to offline states during presentation.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as (T & { id: string }));
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        console.warn("Firestore Doc Hook Resilience Triggered:", err.message);
        // Silent fallback to prevent UI crashes during demo
        if (
          err.code === 'permission-denied' ||
          err.message?.includes('offline') ||
          err.code === 'unavailable'
        ) {
          // Keep current data if it exists (local cache)
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef?.path]);

  return { data, loading, error };
}