import { useState } from "react";
import type { Property } from "../../types/property";
import type {
  DashboardTab,
  DrillDownData,
  PlaaceFilters,
} from "../../types/plaace";
import { usePlaaceData } from "../../hooks/usePlaaceData";
import TabBar from "../ui/TabBar";
import DrillDownModal from "../ui/DrillDownModal";
import PlaaceFilterBar from "./PlaaceFilterBar";
import OverviewTab from "./tabs/OverviewTab";
import DemographicsTab from "./tabs/DemographicsTab";
import VisitorTab from "./tabs/VisitorTab";
import CommerceTab from "./tabs/CommerceTab";
import GrowthTab from "./tabs/GrowthTab";
import DeveloperTab from "./tabs/DeveloperTab";
import { formatNumber, formatCurrency } from "../../utils/format";

const TABS = [
  { key: "oversikt", label: "Oversikt" },
  { key: "demografi", label: "Demografi" },
  { key: "besokende", label: "Besøkende" },
  { key: "handel", label: "Handel" },
  { key: "vekst", label: "Vekst" },
  { key: "utviklere", label: "Utviklere" },
];

type Props = {
  properties: Property[];
};

export default function DashboardTabs({ properties }: Props) {
  const [tab, setTab] = useState<DashboardTab>("oversikt");
  const [filters, setFilters] = useState<PlaaceFilters>({
    year: null,
    quarter: null,
    category: null,
    viewMode: "resident",
  });
  const [drillDown, setDrillDown] = useState<DrillDownData>(null);

  const data = usePlaaceData(filters);

  const renderDrillDown = () => {
    if (!drillDown) return null;
    const { type, payload } = drillDown;

    switch (type) {
      case "store": {
        const s = payload as Record<string, unknown>;
        return (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">{String(s.name)}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Kategori</div>
              <div>{String(s.category)}</div>
              <div className="text-gray-500">Adresse</div>
              <div>{String(s.address)}</div>
              <div className="text-gray-500">Omsetning</div>
              <div>{formatCurrency(Number(s.revenue))}</div>
              <div className="text-gray-500">YoY vekst</div>
              <div>
                {s.yoyGrowth != null ? (
                  <span
                    className={
                      Number(s.yoyGrowth) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {Number(s.yoyGrowth)}%
                  </span>
                ) : (
                  "–"
                )}
              </div>
              <div className="text-gray-500">Ansatte</div>
              <div>{formatNumber(Number(s.employees))}</div>
              <div className="text-gray-500">Markedsandel</div>
              <div>{Number(s.marketShare)}%</div>
              {s.chainEmployees != null && (
                <>
                  <div className="text-gray-500">Kjede total</div>
                  <div>
                    {formatNumber(Number(s.chainEmployees))} ansatte i{" "}
                    {Number(s.chainLocations)} lokasjoner
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }
      case "ageGroup": {
        const r = payload.resident as
          | { group: string; male: number; female: number }
          | undefined;
        const v = payload.visitor as
          | { group: string; male: number; female: number }
          | undefined;
        return (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">
              Aldersgruppe: {String(payload.group)}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div />
              <div className="font-medium text-gray-500">Beboere</div>
              <div className="font-medium text-gray-500">Besøkende</div>
              <div className="text-gray-500">Menn</div>
              <div>{r ? formatNumber(r.male) : "–"}</div>
              <div>{v ? formatNumber(v.male) : "–"}</div>
              <div className="text-gray-500">Kvinner</div>
              <div>{r ? formatNumber(r.female) : "–"}</div>
              <div>{v ? formatNumber(v.female) : "–"}</div>
              <div className="text-gray-500">Total</div>
              <div>{r ? formatNumber(r.male + r.female) : "–"}</div>
              <div>{v ? formatNumber(v.male + v.female) : "–"}</div>
            </div>
          </div>
        );
      }
      case "income": {
        const r = payload.resident as
          | { bracket: string; count: number }
          | undefined;
        const v = payload.visitor as
          | { bracket: string; count: number }
          | undefined;
        return (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">
              Inntekt: {String(payload.bracket)}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Beboere</div>
              <div>{r ? formatNumber(r.count) : "–"}</div>
              <div className="text-gray-500">Besøkende</div>
              <div>{v ? formatNumber(v.count) : "–"}</div>
            </div>
          </div>
        );
      }
      case "origin": {
        return (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">
              {String(payload.area)}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Besøk</div>
              <div>{formatNumber(Number(payload.visits))}</div>
              <div className="text-gray-500">Andel</div>
              <div>{Number(payload.percentage)}%</div>
            </div>
          </div>
        );
      }
      case "growth": {
        const g = payload as Record<string, unknown>;
        const areas = ["gulskogen", "drammen", "norway"] as const;
        const labels = {
          gulskogen: "Gulskogen",
          drammen: "Drammen",
          norway: "Norge",
        };
        return (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">
              Vekst {String(g.year)}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div />
              <div className="font-medium text-gray-500">Vekst</div>
              <div className="font-medium text-gray-500">NOK (M)</div>
              {areas.map((area) => {
                const d = g[area] as { pct: number; nok: number };
                return (
                  <div key={area} className="contents">
                    <div className="text-gray-500">{labels[area]}</div>
                    <div
                      className={d.pct >= 0 ? "text-green-600" : "text-red-600"}
                    >
                      {d.pct}%
                    </div>
                    <div>{formatNumber(Math.round(d.nok))}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case "cardTransaction": {
        return (
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">
              {String(payload.week)}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Beløp</div>
              <div>{Number(payload.amount)} mNOK</div>
              <div className="text-gray-500">Dato</div>
              <div>{String(payload.date)}</div>
            </div>
          </div>
        );
      }
      case "developer": {
        const d = payload as any;
        const financials = d.financials;
        const revenue = financials?.resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter;
        const result = financials?.resultatregnskapResultat?.aarsresultat;
        
        return (
          <div className="space-y-4 text-sm max-h-[70vh] overflow-auto pr-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{d.name}</h3>
              <p className="text-gray-500">{d.orgNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-y-2 py-2 border-y border-gray-100">
              <div className="text-gray-500">Adresse</div>
              <div>{d.address}</div>
              <div className="text-gray-500">Bransje</div>
              <div>{d.industry}</div>
              <div className="text-gray-500">Ansatte</div>
              <div>{d.employees ? formatNumber(d.employees) : "–"}</div>
            </div>

            {revenue != null && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Finansielt (2024)</h4>
                <div className="grid grid-cols-2 gap-y-1">
                  <div className="text-gray-500">Driftsinntekter</div>
                  <div className="font-mono">{formatCurrency(revenue)}</div>
                  <div className="text-gray-500">Årsresultat</div>
                  <div className={`font-mono ${result >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(result)}
                  </div>
                  <div className="text-gray-500">Sum eiendeler</div>
                  <div className="font-mono">{formatCurrency(financials?.eiendeler?.sumEiendeler)}</div>
                </div>
              </div>
            )}

            {d.roles?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Roller ({d.roles.length})</h4>
                <div className="space-y-1 max-h-32 overflow-auto bg-gray-50 p-2 rounded">
                  {d.roles.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-700">{r.name}</span>
                      <span className="text-gray-400 italic">{r.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {d.shareholders?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Eiere</h4>
                <div className="space-y-1 bg-gray-50 p-2 rounded">
                  {d.shareholders.map((s: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-700">{s.name}</span>
                      <span className="text-gray-900 font-medium">{s.percentage?.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-4 overflow-auto h-full scrollbar-thin">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-gray-900">Dashboard</h2>
          <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
            Sundland Bolig Analyse
          </p>
        </div>
        <TabBar
          tabs={TABS}
          active={tab}
          onChange={(k) => setTab(k as DashboardTab)}
        />
      </div>

      <PlaaceFilterBar filters={filters} onChange={setFilters} tab={tab} />

      {tab === "oversikt" && <OverviewTab properties={properties} />}
      {tab === "demografi" && (
        <DemographicsTab
          demographics={data.demographics}
          visitors={data.visitors}
          viewMode={filters.viewMode}
          onDrillDown={setDrillDown}
        />
      )}
      {tab === "besokende" && (
        <VisitorTab visitors={data.visitors} onDrillDown={setDrillDown} />
      )}
      {tab === "handel" && (
        <CommerceTab commerce={data.commerce} onDrillDown={setDrillDown} />
      )}
      {tab === "vekst" && (
        <GrowthTab
          growth={data.growth}
          cardTransactions={data.cardTransactions}
          onDrillDown={setDrillDown}
        />
      )}
      {tab === "utviklere" && <DeveloperTab onDrillDown={setDrillDown} />}

      <DrillDownModal
        open={drillDown !== null}
        onClose={() => setDrillDown(null)}
        title={
          drillDown?.type === "store"
            ? "Butikkdetaljer"
            : drillDown?.type === "ageGroup"
              ? "Aldersgruppe"
              : drillDown?.type === "income"
                ? "Inntektsdetaljer"
                : drillDown?.type === "origin"
                  ? "Besøksopprinnelse"
                  : drillDown?.type === "growth"
                    ? "Vekstdetaljer"
                    : drillDown?.type === "cardTransaction"
                      ? "Korttransaksjon"
                      : drillDown?.type === "developer"
                        ? "Utviklerdetaljer"
                        : "Detaljer"
        }
      >
        {renderDrillDown()}
      </DrillDownModal>
    </div>
  );
}
