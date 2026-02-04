import type {
  Bydel,
  PropertyCategory,
  DevelopmentStatus,
} from "../types/property";

export const BYDEL_LABELS: Record<string, string> = {
  Sundland: "Sundland",
  Stromsoe: "Strømsø",
  Groenland: "Grønland",
  Tangen: "Tangen",
};

export const BYDELER: { value: Bydel; label: string }[] = [
  { value: "Sundland", label: "Sundland" },
  { value: "Stromsoe", label: "Strømsø" },
  { value: "Groenland", label: "Grønland" },
  { value: "Tangen", label: "Tangen" },
];

export const CATEGORIES: PropertyCategory[] = [
  "Rekkehus",
  "Leilighet",
  "Enebolig",
  "Naering",
  "Offentlig",
  "Under utvikling",
];

export const STATUSES: DevelopmentStatus[] = [
  "Ferdigstilt",
  "Under bygging",
  "Planlagt",
  "Regulering",
  "Konsept",
];

export const STORE_CATEGORIES = [
  "Mat og drikke",
  "Klesbutikker",
  "Hus og bygg",
  "Elektrobutikker",
  "Sport og fritid",
  "Hjem og interiør",
  "Smykker og parfyme",
  "Restaurant",
  "Bakeri og kafé",
  "Skjønnhet og velvære",
  "Profesjoner",
  "Annen handel",
  "Bil og Båt",
  "Barer",
  "Byråer",
  "Treningssentre",
  "Andre tjenester",
] as const;
