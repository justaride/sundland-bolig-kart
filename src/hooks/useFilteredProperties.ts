import { useMemo } from "react";
import type {
  Property,
  Bydel,
  PropertyCategory,
  DevelopmentStatus,
} from "../types/property";

export type Filters = {
  bydeler: Bydel[];
  categories: PropertyCategory[];
  statuses: DevelopmentStatus[];
};

export const EMPTY_FILTERS: Filters = {
  bydeler: [],
  categories: [],
  statuses: [],
};

export function useFilteredProperties(
  properties: Property[],
  filters: Filters,
): Property[] {
  return useMemo(() => {
    return properties.filter((p) => {
      if (filters.bydeler.length > 0 && !filters.bydeler.includes(p.bydel))
        return false;
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(p.category)
      )
        return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(p.status))
        return false;
      return true;
    });
  }, [properties, filters]);
}
