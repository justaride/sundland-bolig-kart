export type AgeGenderEntry = {
  group: string;
  male: number;
  female: number;
};

export type BuildingEntry = {
  type: string;
  count: number;
};

export type HouseholdEntry = {
  type: string;
  count: number;
};

export type IncomeBracketEntry = {
  bracket: string;
  count: number;
};

export type MedianIncomeEntry = {
  type: string;
  amount: number;
};

export type PopulationTrendEntry = {
  year: number;
  population: number;
  trendline: number;
};

export type DemographicsData = {
  ageDistribution: AgeGenderEntry[];
  buildings: BuildingEntry[];
  households: HouseholdEntry[];
  incomeDistribution: IncomeBracketEntry[];
  medianIncome: MedianIncomeEntry[];
  populationTrend: PopulationTrendEntry[];
};

export type HourlyEntry = {
  hour: string;
  visitors: number;
  work: number;
  home: number;
};

export type WeekdayEntry = {
  day: string;
  visitors: number;
  work: number;
  home: number;
};

export type QuarterlyEntry = {
  quarter: string;
  visitors2023: number;
  visitors2024: number;
  visitors2025: number;
  work2023: number;
  work2024: number;
  work2025: number;
  home2023: number;
  home2024: number;
  home2025: number;
};

export type OriginEntry = {
  area: string;
  visits: number;
  percentage: number;
};

export type VisitorsData = {
  ageDistribution: AgeGenderEntry[];
  buildings: BuildingEntry[];
  households: HouseholdEntry[];
  income: IncomeBracketEntry[];
  medianIncome: MedianIncomeEntry[];
  hourly: HourlyEntry[];
  weekday: WeekdayEntry[];
  quarterly: QuarterlyEntry[];
  origins: OriginEntry[];
};

export type Store = {
  rank: number;
  name: string;
  category: string;
  address: string;
  municipality: string;
  revenue: number;
  chainShare: number | null;
  yoyGrowth: number | null;
  employees: number;
  chainEmployees: number | null;
  chainLocations: number | null;
  marketShare: number;
};

export type CategoryMixEntry = {
  level1: string;
  level2: string;
  percentage: number;
};

export type ChainVsIndependentEntry = {
  year: number;
  independent: number;
  chain: number;
};

export type OverUnderEntry = {
  category: string;
  value: number;
};

export type CommerceData = {
  stores: Store[];
  categoryMix: CategoryMixEntry[];
  chainVsIndependent: ChainVsIndependentEntry[];
  overUnderRepresentation: OverUnderEntry[];
};

export type WeeklyCardEntry = {
  week: string;
  amount: number;
  date: string;
};

export type WeekdayCardEntry = {
  day: string;
  [year: string]: string | number | null;
};

export type CardTransactionsData = {
  weekly: WeeklyCardEntry[];
  byWeekday: WeekdayCardEntry[];
};

export type AnnualGrowthEntry = {
  year: number;
  gulskogenPct: number;
  gulskogenNok: number;
  drammenPct: number;
  drammenNok: number;
  norwayPct: number | null;
  norwayNok: number | null;
};

export type IndexedGrowthEntry = {
  date: string;
  value: number;
};

export type CategoryDevelopmentEntry = {
  year: number;
  dining: number;
  retail: number;
  services: number;
};

export type GrowthData = {
  annualGrowth: AnnualGrowthEntry[];
  indexedGrowth: IndexedGrowthEntry[];
  categoryDevelopment: CategoryDevelopmentEntry[];
};

export type KeyMetrics = {
  area: string;
  demography: { population: number; density: number; area: number };
  movement: { dailyVisits: number; perKm2: number; busiestDay: string };
  cardTransactions: {
    weeklyAvg: number;
    totalStores: number;
    totalRevenue: number;
  };
};

export type DashboardTab =
  | "oversikt"
  | "demografi"
  | "besokende"
  | "handel"
  | "vekst";

export type PlaaceFilters = {
  year: number | null;
  quarter: string | null;
  category: string | null;
  viewMode: "resident" | "visitor";
};

export type DrillDownData = {
  type:
    | "store"
    | "ageGroup"
    | "income"
    | "origin"
    | "growth"
    | "cardTransaction";
  payload: Record<string, unknown>;
} | null;
