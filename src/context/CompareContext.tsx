'use client';

import { createContext, useContext, useState, ReactNode } from "react";
import { Car } from "@/lib/types";

type CompareContextType = {
  compareList: Car[];
  addToCompare: (car: Car) => void;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  isInCompare: (carId: string) => boolean;
  canAdd: boolean;
};

const CompareContext = createContext<CompareContextType>({
  compareList: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
  canAdd: true,
});

/**
 * Compare Provider Terminal.
 * Manages the state of vehicles selected for comparison (Max 3).
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Car[]>([]);

  const addToCompare = (car: Car) => {
    if (compareList.length >= 3) return;
    if (compareList.find(c => c.id === car.id)) return;
    setCompareList(prev => [...prev, car]);
  };

  const removeFromCompare = (carId: string) => {
    setCompareList(prev => prev.filter(c => c.id !== carId));
  };

  const clearCompare = () => setCompareList([]);

  const isInCompare = (carId: string) => {
    return compareList.some(c => c.id === carId);
  };

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAdd: compareList.length < 3,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
