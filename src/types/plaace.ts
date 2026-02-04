export type AreaMetrics = {
  demography: { population: number; density: number; area: number };
  movement: { dailyVisits: number; perKm2: number; busiestDay: string };
  cardTransactions: { daily: number; total: number; perTransaction: number };
};
