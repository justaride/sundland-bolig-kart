import { useMemo } from "react";
import type { StoreLocation, StoreFilters } from "../types/store";

export const EMPTY_STORE_FILTERS: StoreFilters = {
  enabled: true,
  categories: [],
  minRevenue: 0,
};

export function useFilteredStores(
  stores: StoreLocation[],
  filters: StoreFilters,
): StoreLocation[] {
  return useMemo(() => {
    if (!filters.enabled) return [];
    return stores.filter((s) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(s.category)
      )
        return false;
      if (s.revenue < filters.minRevenue) return false;
      return true;
    });
  }, [stores, filters]);
}
