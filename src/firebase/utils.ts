'use client';

import { useRef } from 'react';

/**
 * A custom hook to stabilize Firebase references and queries.
 * It ensures that the reference only changes if the underlying dependencies change,
 * preventing infinite re-render loops in hooks like useCollection and useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T } | null>(null);

  const isDepsEqual = (oldDeps: any[], newDeps: any[]) => {
    if (oldDeps.length !== newDeps.length) return false;
    for (let i = 0; i < oldDeps.length; i++) {
      if (oldDeps[i] !== newDeps[i]) return false;
    }
    return true;
  };

  if (!ref.current || !isDepsEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
}
