import type { PropertyCategory } from "../types/property";

export const CATEGORY_COLORS: Record<PropertyCategory, string> = {
  Rekkehus: "#16a34a",
  Leilighet: "#3b82f6",
  Enebolig: "#8b5cf6",
  Naering: "#d97706",
  Offentlig: "#64748b",
  "Under utvikling": "#dc2626",
};

export const MAP_CENTER: [number, number] = [59.738, 10.205];
export const MAP_ZOOM = 14;
export const MAX_CLUSTER_RADIUS = 30;

export const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';
