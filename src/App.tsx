import { useState, useCallback } from "react";
import PropertyMap from "./components/Map/PropertyMap";
import FilterPanel from "./components/FilterPanel";
import FloatingStats from "./components/FloatingStats";
import PropertyTable from "./components/PropertyTable";
import StatsPanel from "./components/StatsPanel";
import properties from "./data/properties.json";
import type { Property } from "./types/property";
import { CATEGORY_COLORS } from "./constants/designSystem";
import {
  useFilteredProperties,
  EMPTY_FILTERS,
} from "./hooks/useFilteredProperties";
import type { Filters } from "./hooks/useFilteredProperties";
import { MapPin, Table, ChartBar } from "@phosphor-icons/react";

const typedProperties = properties as Property[];

type View = "kart" | "tabell" | "dashboard";

const VIEW_OPTIONS: { value: View; label: string; icon: typeof MapPin }[] = [
  { value: "kart", label: "Kart", icon: MapPin },
  { value: "tabell", label: "Tabell", icon: Table },
  { value: "dashboard", label: "Dashboard", icon: ChartBar },
];

const categories = Object.entries(CATEGORY_COLORS) as [string, string][];

export default function App() {
  const [view, setView] = useState<View>("kart");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const filtered = useFilteredProperties(typedProperties, filters);

  const handleSelectProperty = useCallback((_id: string) => {
    setView("kart");
  }, []);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Sundland Bolig
          </h1>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setView(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={14} weight={view === value ? "fill" : "regular"} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200"
          >
            {sidebarOpen ? "Skjul filtre" : "Vis filtre"}
          </button>
          <div className="flex gap-3">
            {categories.map(([name, color]) => (
              <div
                key={name}
                className="flex items-center gap-1.5 text-xs text-gray-600"
              >
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ background: color }}
                />
                {name}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="w-56 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
            <FilterPanel filters={filters} onChange={setFilters} />
          </aside>
        )}

        <main className="flex-1 relative">
          {view === "kart" && (
            <>
              <FloatingStats properties={filtered} />
              <PropertyMap properties={filtered} />
            </>
          )}
          {view === "tabell" && (
            <PropertyTable
              properties={filtered}
              onSelectProperty={handleSelectProperty}
            />
          )}
          {view === "dashboard" && (
            <div className="bg-gray-50 h-full">
              <StatsPanel properties={filtered} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
