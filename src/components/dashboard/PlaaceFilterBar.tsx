import type { PlaaceFilters, DashboardTab } from "../../types/plaace";

const YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
];
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

type Props = {
  filters: PlaaceFilters;
  onChange: (f: PlaaceFilters) => void;
  tab: DashboardTab;
};

export default function PlaaceFilterBar({ filters, onChange, tab }: Props) {
  const showYear = tab === "vekst" || tab === "handel";
  const showQuarter = tab === "besokende";
  const showViewMode = tab === "demografi";
  const showCategory = tab === "handel";

  const categories = ["Mat og opplevelser", "Handel", "Tjenester"];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {showYear && (
        <select
          value={filters.year ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              year: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700"
        >
          <option value="">Alle år</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      )}

      {showQuarter && (
        <div className="flex gap-1">
          <button
            onClick={() => onChange({ ...filters, quarter: null })}
            className={`px-2 py-1 rounded text-xs ${
              !filters.quarter
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Alle
          </button>
          {QUARTERS.map((q) => (
            <button
              key={q}
              onClick={() =>
                onChange({
                  ...filters,
                  quarter: filters.quarter === q ? null : q,
                })
              }
              className={`px-2 py-1 rounded text-xs ${
                filters.quarter === q
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {showViewMode && (
        <div className="flex gap-1">
          {(["resident", "visitor"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onChange({ ...filters, viewMode: mode })}
              className={`px-2 py-1 rounded text-xs ${
                filters.viewMode === mode
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {mode === "resident" ? "Beboere" : "Besøkende"}
            </button>
          ))}
        </div>
      )}

      {showCategory && (
        <div className="flex gap-1">
          <button
            onClick={() => onChange({ ...filters, category: null })}
            className={`px-2 py-1 rounded text-xs ${
              !filters.category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Alle
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() =>
                onChange({
                  ...filters,
                  category: filters.category === c ? null : c,
                })
              }
              className={`px-2 py-1 rounded text-xs ${
                filters.category === c
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
