import { useMemo } from "react";
import type { PlaaceFilters } from "../types/plaace";
import type {
  DemographicsData,
  VisitorsData,
  CommerceData,
  CardTransactionsData,
  GrowthData,
} from "../types/plaace";
import demographicsRaw from "../data/plaace/demographics.json";
import visitorsRaw from "../data/plaace/visitors.json";
import commerceRaw from "../data/plaace/commerce.json";
import cardTransactionsRaw from "../data/plaace/cardTransactions.json";
import growthRaw from "../data/plaace/growth.json";
import keyMetricsRaw from "../data/plaace/keyMetrics.json";

const demographics = demographicsRaw as DemographicsData;
const visitors = visitorsRaw as VisitorsData;
const commerce = commerceRaw as CommerceData;
const cardTransactions = cardTransactionsRaw as unknown as CardTransactionsData;
const growth = growthRaw as unknown as GrowthData;

export function usePlaaceData(filters: PlaaceFilters) {
  const filteredGrowth = useMemo(() => {
    let annual = growth.annualGrowth;
    let indexed = growth.indexedGrowth;
    let catDev = growth.categoryDevelopment;

    if (filters.year) {
      annual = annual.filter((r) => r.year === filters.year);
      catDev = catDev.filter((r) => r.year === filters.year);
      indexed = indexed.filter((r) => r.date.startsWith(String(filters.year)));
    }

    return {
      annualGrowth: annual,
      indexedGrowth: indexed,
      categoryDevelopment: catDev,
    };
  }, [filters.year]);

  const filteredCardTransactions = useMemo(() => {
    let weekly = cardTransactions.weekly;
    let byWeekday = cardTransactions.byWeekday;

    if (filters.year) {
      const yearStr = String(filters.year);
      weekly = weekly.filter((r) => r.week.includes(yearStr));
      byWeekday = byWeekday.map((r) => ({
        day: r.day,
        [yearStr]: r[yearStr],
      }));
    }

    return { weekly, byWeekday };
  }, [filters.year]);

  const filteredCommerce = useMemo(() => {
    let stores = commerce.stores;
    let chain = commerce.chainVsIndependent;

    if (filters.year) {
      chain = chain.filter((r) => r.year === filters.year);
    }
    if (filters.category) {
      stores = stores.filter((s) =>
        s.category.toLowerCase().includes(filters.category!.toLowerCase()),
      );
    }

    return {
      stores,
      categoryMix: commerce.categoryMix,
      chainVsIndependent: chain,
      overUnderRepresentation: commerce.overUnderRepresentation,
    };
  }, [filters.year, filters.category]);

  return {
    demographics,
    visitors,
    commerce: filteredCommerce,
    cardTransactions: filteredCardTransactions,
    growth: filteredGrowth,
    keyMetrics: keyMetricsRaw,
  };
}
