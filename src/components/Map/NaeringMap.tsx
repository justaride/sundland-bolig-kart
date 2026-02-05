import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { StoreLocation } from "../../types/store";
import {
  STORE_CATEGORY_COLORS,
  MAP_CENTER,
  MAP_ZOOM,
  TILE_URL,
  TILE_ATTRIBUTION,
} from "../../constants/designSystem";
import { formatCurrency } from "../../utils/format";
import { CornersOut, CornersIn } from "@phosphor-icons/react";

type Props = {
  stores: StoreLocation[];
};

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

function StorePopupContent({ s }: { s: StoreLocation }) {
  return (
    <div className="min-w-[200px] max-w-[260px] text-sm">
      <h3 className="text-base font-semibold mb-1">{s.name}</h3>
      <div className="flex gap-2 mb-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded text-white font-medium"
          style={{ background: STORE_CATEGORY_COLORS[s.category] ?? "#6b7280" }}
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
        {s.orgNr && <PopupRow label="Org.nr" value={s.orgNr} mono />}
      </div>
      {(s.website || s.phone || s.facebook || s.instagram) && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
          {s.website && (
            <div className="flex justify-between text-xs gap-4">
              <span className="text-gray-500">Nettside</span>
              <a
                href={
                  s.website.startsWith("http")
                    ? s.website
                    : `https://${s.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate max-w-[160px]"
              >
                {s.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {s.phone && <PopupRow label="Telefon" value={s.phone} />}
          {(s.facebook || s.instagram) && (
            <div className="flex gap-2 mt-1">
              {s.facebook && (
                <a
                  href={s.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Facebook
                </a>
              )}
              {s.instagram && (
                <a
                  href={s.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-pink-600 hover:underline"
                >
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>
      )}
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

export default function NaeringMap({ stores }: Props) {
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
      </MapContainer>
    </div>
  );
}
