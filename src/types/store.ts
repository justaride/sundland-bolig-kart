export type CoordinateSource =
  | "kartverket"
  | "manual"
  | "shopping_center"
  | "nominatim";

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
  coordinateSource: CoordinateSource;
  orgNr: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
};

export type StoreFilters = {
  categories: string[];
  minRevenue: number;
};
