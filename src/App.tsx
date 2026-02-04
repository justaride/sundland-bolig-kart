import { useState, useCallback, lazy, Suspense } from "react";
import AppLayout from "./components/Layout/AppLayout";
import Sidebar from "./components/Layout/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import FilterPanel from "./components/FilterPanel";
import FloatingStats from "./components/FloatingStats";
import properties from "./data/properties.json";
import storeLocations from "./data/storeLocations.json";
import type { Property } from "./types/property";
import type { StoreLocation } from "./types/store";
import {
  useFilteredProperties,
  EMPTY_FILTERS,
} from "./hooks/useFilteredProperties";
import type { Filters } from "./hooks/useFilteredProperties";
import {
  useFilteredStores,
  EMPTY_STORE_FILTERS,
} from "./hooks/useFilteredStores";
import type { StoreFilters } from "./types/store";

const PropertyMap = lazy(() => import("./components/Map/PropertyMap"));
const PropertyTable = lazy(() => import("./components/PropertyTable"));
const StatsPanel = lazy(() => import("./components/StatsPanel"));

const typedProperties = properties as Property[];
const typedStores = storeLocations as StoreLocation[];

type View = "kart" | "tabell" | "dashboard";

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("kart");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [storeFilters, setStoreFilters] =
    useState<StoreFilters>(EMPTY_STORE_FILTERS);
  const filtered = useFilteredProperties(typedProperties, filters);
  const filteredStores = useFilteredStores(typedStores, storeFilters);

  const handleSelectProperty = useCallback((_id: string) => {
    setView("kart");
  }, []);

  return (
    <ErrorBoundary>
      <AppLayout
        sidebar={
          <Sidebar
            view={view}
            onViewChange={setView}
            filterPanel={
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                storeFilters={storeFilters}
                onStoreFiltersChange={setStoreFilters}
                totalCount={typedProperties.length}
                filteredCount={filtered.length}
              />
            }
          />
        }
      >
        <Suspense fallback={<LoadingSpinner />}>
          {view === "kart" && (
            <div key="kart" className="h-full relative animate-fade-slide-in">
              <FloatingStats properties={filtered} />
              <PropertyMap properties={filtered} stores={filteredStores} />
            </div>
          )}
          {view === "tabell" && (
            <div key="tabell" className="h-full animate-fade-slide-in">
              <PropertyTable
                properties={filtered}
                onSelectProperty={handleSelectProperty}
              />
            </div>
          )}
          {view === "dashboard" && (
            <div key="dashboard" className="h-full animate-fade-slide-in">
              <StatsPanel properties={filtered} />
            </div>
          )}
        </Suspense>
      </AppLayout>
    </ErrorBoundary>
  );
}
