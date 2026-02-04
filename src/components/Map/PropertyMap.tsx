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
import { formatNumber, formatCurrency, formatSqm } from "../../utils/format";

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

function bydelLabel(b: string): string {
  const map: Record<string, string> = {
    Sundland: "Sundland",
    Stromsoe: "Strømsø",
    Groenland: "Grønland",
    Tangen: "Tangen",
  };
  return map[b] ?? b;
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

      <table className="w-full text-xs">
        <tbody>
          <Row label="Bydel" value={bydelLabel(p.bydel)} />
          {p.address && <Row label="Adresse" value={p.address} />}
          {p.developer && <Row label="Utvikler" value={p.developer.name} />}
          {p.units && <Row label="Enheter" value={formatNumber(p.units)} />}
          {p.sqmTotal && <Row label="Areal" value={formatSqm(p.sqmTotal)} />}
          {p.sqmPerUnit && (
            <Row
              label="m²/enhet"
              value={`${p.sqmPerUnit.min}–${p.sqmPerUnit.max}`}
            />
          )}
          {p.pricePerSqm && (
            <Row label="Pris/m²" value={formatCurrency(p.pricePerSqm)} />
          )}
          {p.estimatedPrice && (
            <Row
              label="Prisestimat"
              value={`${formatCurrency(p.estimatedPrice.min)} – ${formatCurrency(p.estimatedPrice.max)}`}
            />
          )}
          {p.floors && <Row label="Etasjer" value={String(p.floors)} />}
          {p.yearCompleted && (
            <Row label="Ferdigstilt" value={String(p.yearCompleted)} />
          )}
          {p.yearPlanned && (
            <Row label="Planlagt" value={String(p.yearPlanned)} />
          )}
        </tbody>
      </table>

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
          style={{ background: STORE_CATEGORY_COLORS[s.category] ?? "#6b7280" }}
        >
          {s.category}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {s.topCategory}
        </span>
      </div>
      <table className="w-full text-xs">
        <tbody>
          <Row label="Adresse" value={s.address} />
          <Row label="Omsetning" value={formatCurrency(s.revenue)} />
          <Row label="Ansatte" value={String(s.employees)} />
          {s.yoyGrowth !== null && (
            <Row
              label="Vekst (YoY)"
              value={`${s.yoyGrowth > 0 ? "+" : ""}${s.yoyGrowth}%`}
            />
          )}
          <Row label="Markedsandel" value={`${s.marketShare}%`} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-0.5 pr-2 text-gray-500 whitespace-nowrap">{label}</td>
      <td className="py-0.5 font-medium">{value}</td>
    </tr>
  );
}

export default function PropertyMap({ properties, stores }: Props) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      <MarkerClusterGroup maxClusterRadius={MAX_CLUSTER_RADIUS} chunkedLoading>
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              className: "",
              iconSize: [36, 36],
              html: `<div style="
                width:36px;height:36px;border-radius:6px;
                background:#475569;border:2px solid white;
                box-shadow:0 2px 6px rgba(0,0,0,0.3);
                display:flex;align-items:center;justify-content:center;
                color:white;font-size:12px;font-weight:600;
              ">${count}</div>`,
            });
          }}
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
  );
}
