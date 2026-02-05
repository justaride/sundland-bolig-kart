export type StoreLocation = {
  id: string;
  name: string;
  category: string;
  topCategory: string;
  address: string;
  lat: number;
  lng: number;
  revenue: number;
  employees: number;
  yoyGrowth: number | null;
  marketShare: number;
  chainLocations: number | null;
};

export type StoreFilters = {
  categories: string[];
  minRevenue: number;
};
