import { createContext, useContext, useState, type ReactNode } from "react";
import type { PlaaceFilters } from "../types/plaace";

const DEFAULT_FILTERS: PlaaceFilters = {
  year: null,
  quarter: null,
  category: null,
  viewMode: "resident",
};

type FilterContextValue = {
  filters: PlaaceFilters;
  setFilters: React.Dispatch<React.SetStateAction<PlaaceFilters>>;
  resetFilters: () => void;
};

const PlaaceFilterContext = createContext<FilterContextValue | null>(null);

export function PlaaceFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PlaaceFilters>(DEFAULT_FILTERS);
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <PlaaceFilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </PlaaceFilterContext.Provider>
  );
}

export function usePlaaceFilters(): FilterContextValue {
  const ctx = useContext(PlaaceFilterContext);
  if (!ctx)
    throw new Error("usePlaaceFilters must be within PlaaceFilterProvider");
  return ctx;
}
