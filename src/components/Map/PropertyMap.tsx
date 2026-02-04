import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "../../types/property";
import type { StoreLocation } from "../../types/store";
import {
  CATEGORY_COLORS,
  STORE_CATEGORY_COLORS,
  MAP_CENTER,
  MAP_ZOOM,
  MAX_CLUSTER_RADIUS,
  TILE_URL,
  TILE_ATTRIBUTION,
} from "../../constants/designSystem";
import { BYDEL_LABELS } from "../../constants/labels";
import { formatNumber, formatCurrency, formatSqm } from "../../utils/format";
import { CornersOut, CornersIn } from "@phosphor-icons/react";

type Props = {
  properties: Property[];
  stores: StoreLocation[];
};

function createIcon(category: Property["category"]): L.DivIcon {
  const color = CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
  });
}

function createStoreIcon(category: string): L.DivIcon {
  const color = STORE_CATEGORY_COLORS[category] ?? "#6b7280";
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
    html: `<div style="
      width:22px;height:22px;border-radius:4px;
      background:${color};border:2px solid white;
      box-shadow:0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
  });
}

function PopupContent({ p }: { p: Property }) {
  return (
    <div className="min-w-[220px] max-w-[280px] text-sm">
      <h3 className="text-base font-semibold mb-1">{p.name}</h3>
      <div className="flex gap-2 mb-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
          style={{ background: CATEGORY_COLORS[p.category] }}
        >
          {p.category}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
          {p.status}
        </span>
      </div>

      <div className="space-y-1">
        <PopupRow label="Bydel" value={BYDEL_LABELS[p.bydel] ?? p.bydel} />
        {p.address && <PopupRow label="Adresse" value={p.address} />}
        {p.developer && <PopupRow label="Utvikler" value={p.developer.name} />}
        {p.units && <PopupRow label="Enheter" value={formatNumber(p.units)} />}
        {p.sqmTotal && <PopupRow label="Areal" value={formatSqm(p.sqmTotal)} />}
        {p.sqmPerUnit && (
          <PopupRow
            label="m²/enhet"
            value={`${p.sqmPerUnit.min}–${p.sqmPerUnit.max}`}
          />
        )}
        {p.pricePerSqm && (
          <PopupRow
            label="Pris/m²"
            value={formatCurrency(p.pricePerSqm)}
            mono
          />
        )}
        {p.estimatedPrice && (
          <PopupRow
            label="Prisestimat"
            value={`${formatCurrency(p.estimatedPrice.min)} – ${formatCurrency(p.estimatedPrice.max)}`}
            mono
          />
        )}
        {p.floors && <PopupRow label="Etasjer" value={String(p.floors)} />}
        {p.yearCompleted && (
          <PopupRow label="Ferdigstilt" value={String(p.yearCompleted)} />
        )}
        {p.yearPlanned && (
          <PopupRow label="Planlagt" value={String(p.yearPlanned)} />
        )}
      </div>

      {p.description && (
        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
          {p.description}
        </p>
      )}

      {p.website && (
        <a
          href={p.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-blue-600 hover:underline"
        >
          Besøk nettside &rarr;
        </a>
      )}
    </div>
  );
}

function StorePopupContent({ s }: { s: StoreLocation }) {
  return (
    <div className="min-w-[200px] max-w-[260px] text-sm">
      <h3 className="text-base font-semibold mb-1">{s.name}</h3>
      <div className="flex gap-2 mb-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded text-white font-medium"
          style={{
            background: STORE_CATEGORY_COLORS[s.category] ?? "#6b7280",
          }}
        >
          {s.category}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {s.topCategory}
        </span>
      </div>
      <div className="space-y-1">
        <PopupRow label="Adresse" value={s.address} />
        <PopupRow label="Omsetning" value={formatCurrency(s.revenue)} mono />
        <PopupRow label="Ansatte" value={String(s.employees)} />
        {s.yoyGrowth !== null && (
          <PopupRow
            label="Vekst (YoY)"
            value={`${s.yoyGrowth > 0 ? "+" : ""}${s.yoyGrowth}%`}
            positive={s.yoyGrowth >= 0}
          />
        )}
        <PopupRow label="Markedsandel" value={`${s.marketShare}%`} />
      </div>
    </div>
  );
}

function PopupRow({
  label,
  value,
  mono,
  positive,
}: {
  label: string;
  value: string;
  mono?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex justify-between text-xs gap-4">
      <span className="text-gray-500 whitespace-nowrap">{label}</span>
      <span
        className={`font-medium text-right ${mono ? "font-mono tabular-nums" : ""} ${positive === true ? "text-green-600" : positive === false ? "text-red-600" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 50 ? 48 : 56;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:6px;
      background:linear-gradient(135deg,#1e3a5f,#2d4a6f);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${size < 48 ? 12 : 14}px;font-weight:600;
      font-family:'JetBrains Mono',monospace;
    ">${count}</div>`,
  });
}

export default function PropertyMap({ properties, stores }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      className={
        fullscreen ? "fixed inset-0 z-[1000]" : "h-full w-full relative"
      }
    >
      <button
        onClick={() => setFullscreen((f) => !f)}
        className="absolute top-3 left-3 z-[1001] glass-panel rounded-lg p-2 shadow-md hover:bg-white/90 transition-colors"
      >
        {fullscreen ? (
          <CornersIn size={18} weight="bold" />
        ) : (
          <CornersOut size={18} weight="bold" />
        )}
      </button>

      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

        <MarkerClusterGroup
          maxClusterRadius={MAX_CLUSTER_RADIUS}
          chunkedLoading
        >
          {properties.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createIcon(p.category)}
            >
              <Popup>
                <PopupContent p={p} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {stores.length > 0 && (
          <MarkerClusterGroup
            maxClusterRadius={40}
            chunkedLoading
            iconCreateFunction={createClusterIcon}
          >
            {stores.map((s) => (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={createStoreIcon(s.category)}
              >
                <Popup>
                  <StorePopupContent s={s} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
}
