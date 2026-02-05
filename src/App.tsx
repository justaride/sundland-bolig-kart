import { useState, lazy, Suspense } from "react";
import AppLayout from "./components/Layout/AppLayout";
import Sidebar from "./components/Layout/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import NaeringFilterPanel from "./components/NaeringFilterPanel";
import BoligFilterPanel from "./components/BoligFilterPanel";
import BoligView from "./components/BoligView";
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

const NaeringMap = lazy(() => import("./components/Map/NaeringMap"));
const StatsPanel = lazy(() => import("./components/StatsPanel"));

const typedProperties = properties as Property[];
const typedStores = storeLocations as StoreLocation[];

type View = "naering" | "dashboard" | "bolig";

function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("naering");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [storeFilters, setStoreFilters] =
    useState<StoreFilters>(EMPTY_STORE_FILTERS);
  const filtered = useFilteredProperties(typedProperties, filters);
  const filteredStores = useFilteredStores(typedStores, storeFilters);

  const filterPanel =
    view === "naering" ? (
      <NaeringFilterPanel
        filters={storeFilters}
        onChange={setStoreFilters}
        totalCount={typedStores.length}
        filteredCount={filteredStores.length}
      />
    ) : view === "bolig" ? (
      <BoligFilterPanel
        filters={filters}
        onChange={setFilters}
        totalCount={typedProperties.length}
        filteredCount={filtered.length}
      />
    ) : null;

  return (
    <ErrorBoundary>
      <AppLayout
        sidebar={
          <Sidebar
            view={view}
            onViewChange={setView}
            filterPanel={filterPanel}
          />
        }
      >
        <Suspense fallback={<LoadingSpinner />}>
          {view === "naering" && (
            <div
              key="naering"
              className="h-full relative animate-fade-slide-in"
            >
              <NaeringMap stores={filteredStores} />
            </div>
          )}
          {view === "dashboard" && (
            <div key="dashboard" className="h-full animate-fade-slide-in">
              <StatsPanel properties={filtered} />
            </div>
          )}
          {view === "bolig" && (
            <div key="bolig" className="h-full animate-fade-slide-in">
              <BoligView properties={filtered} />
            </div>
          )}
        </Suspense>
      </AppLayout>
    </ErrorBoundary>
  );
}
