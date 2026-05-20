'use client';

import { useEffect, useState } from 'react';
import { 
  onSnapshot, 
  Query, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';

/**
 * A hook to subscribe to a Firestore collection query.
 * Handles loading states and provides silent fallback for errors.
 * Optimized for local-first presentation.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        console.warn("Firestore Collection Resilience Triggered:", err.message);
        
        // Handling common "offline" or connection errors without crashing the UI
        if (
          err.code === 'permission-denied' ||
          err.message?.includes('offline') ||
          err.code === 'unavailable' ||
          err.message?.includes('index')
        ) {
          // If we have cached data, keep it. Otherwise, set empty.
          if (!data) setData([]);
          setLoading(false);
          return;
        }
        
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
