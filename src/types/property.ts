export type Bydel = "Sundland" | "Stromsoe" | "Groenland" | "Tangen";

export type PropertyCategory =
  | "Rekkehus"
  | "Leilighet"
  | "Enebolig"
  | "Naering"
  | "Offentlig"
  | "Under utvikling";

export type DevelopmentStatus =
  | "Ferdigstilt"
  | "Under bygging"
  | "Planlagt"
  | "Regulering"
  | "Konsept";

export type Property = {
  id: string;
  name: string;
  address: string | null;
  bydel: Bydel;
  category: PropertyCategory;
  status: DevelopmentStatus;
  lat: number;
  lng: number;
  developer: { name: string; orgNumber: string | null } | null;
  units: number | null;
  sqmTotal: number | null;
  sqmPerUnit: { min: number; max: number } | null;
  pricePerSqm: number | null;
  estimatedPrice: { min: number; max: number } | null;
  yearCompleted: number | null;
  yearPlanned: number | null;
  floors: number | null;
  parking: boolean | null;
  reguleringsplan: string | null;
  description: string | null;
  website: string | null;
  lastUpdated: string;
};
