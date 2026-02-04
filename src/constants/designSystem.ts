import type { PropertyCategory } from "../types/property";

export const COLORS = {
  SUNDLAND_DEEP: "#1e3a5f",
  SUNDLAND_MEDIUM: "#2d4a6f",
  GLACIER: "#e0f2fe",
  FOREST: "#16a34a",
  AMBER: "#d97706",
  BERRY: "#8b5cf6",
  SLATE_50: "#f8fafc",
  SLATE_100: "#f1f5f9",
  SLATE_200: "#e2e8f0",
  SLATE_300: "#cbd5e1",
  SLATE_400: "#94a3b8",
  SLATE_500: "#64748b",
  SLATE_600: "#475569",
  SLATE_700: "#334155",
  SLATE_800: "#1e293b",
  SLATE_900: "#0f172a",
  TEXT_PRIMARY: "#0f172a",
  TEXT_SECONDARY: "#475569",
  TEXT_MUTED: "#94a3b8",
  BG_PRIMARY: "#ffffff",
  BG_SECONDARY: "#f8fafc",
  BG_TERTIARY: "#f1f5f9",
  BORDER_DEFAULT: "#e2e8f0",
  BORDER_LIGHT: "#f1f5f9",
  GRID_LIGHT: "#f1f5f9",
} as const;

export const CHART_COLORS = {
  primary: COLORS.SUNDLAND_DEEP,
  secondary: COLORS.BERRY,
  positive: COLORS.FOREST,
  negative: "#ef4444",
  warning: COLORS.AMBER,
  neutral: COLORS.SLATE_400,
} as const;

export const CHART_CONFIG = {
  grid: { strokeDasharray: "3 3", stroke: COLORS.GRID_LIGHT },
  axis: { fontSize: 12, fill: COLORS.TEXT_MUTED },
  bar: { radius: [4, 4, 0, 0] as [number, number, number, number] },
  barHorizontal: { radius: [0, 4, 4, 0] as [number, number, number, number] },
  line: { strokeWidth: 2 },
  area: { fillOpacity: 0.3 },
} as const;

export const CATEGORY_COLORS: Record<PropertyCategory, string> = {
  Rekkehus: "#16a34a",
  Leilighet: "#3b82f6",
  Enebolig: "#8b5cf6",
  Naering: "#d97706",
  Offentlig: "#64748b",
  "Under utvikling": "#dc2626",
};

export const MAP_CENTER: [number, number] = [59.742, 10.167];
export const MAP_ZOOM = 14;
export const MAX_CLUSTER_RADIUS = 30;

export const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export const STORE_CATEGORY_COLORS: Record<string, string> = {
  "Mat og drikke": "#ef4444",
  "Hus og bygg": "#f97316",
  Elektrobutikker: "#06b6d4",
  Klesbutikker: "#ec4899",
  "Sport og fritid": "#10b981",
  "Smykker og parfyme": "#a855f7",
  "Hjem og interiør": "#f59e0b",
  "Annen handel": "#6b7280",
  "Bil og Båt": "#475569",
  Restaurant: "#dc2626",
  "Bakeri og kafé": "#b45309",
  Barer: "#7c3aed",
  Profesjoner: "#0284c7",
  "Skjønnhet og velvære": "#db2777",
  Treningssentre: "#059669",
  Byråer: "#4f46e5",
  "Andre tjenester": "#71717a",
};

export const STORE_TOP_CATEGORIES = [
  "Handel",
  "Mat og opplevelser",
  "Tjenester",
] as const;

export const MIN_REVENUE_DEFAULT = 0;
export const MAX_REVENUE = 140000000;
