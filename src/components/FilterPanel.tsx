import type { Filters } from "../hooks/useFilteredProperties";
import type { StoreFilters } from "../types/store";
import {
  CATEGORY_COLORS,
  STORE_CATEGORY_COLORS,
  MAX_REVENUE,
} from "../constants/designSystem";
import {
  BYDELER,
  CATEGORIES,
  STATUSES,
  STORE_CATEGORIES,
} from "../constants/labels";
import { formatNumber } from "../utils/format";
import ToggleSwitch from "./ui/ToggleSwitch";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  storeFilters: StoreFilters;
  onStoreFiltersChange: (filters: StoreFilters) => void;
  totalCount?: number;
  filteredCount?: number;
};

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default function FilterPanel({
  filters,
  onChange,
  storeFilters,
  onStoreFiltersChange,
  totalCount,
  filteredCount,
}: Props) {
  const hasPropertyFilters =
    filters.bydeler.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0;

  const hasStoreFilters =
    storeFilters.categories.length > 0 || storeFilters.minRevenue > 0;

  const hasAnyFilter = hasPropertyFilters || hasStoreFilters;

  return (
    <div className="p-4 space-y-5 text-sm">
      {totalCount != null && filteredCount != null && (
        <div className="text-xs text-gray-400 font-mono tabular-nums">
          Viser {filteredCount} / {totalCount}
        </div>
      )}

      <Section title="Bydel">
        {BYDELER.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.bydeler.includes(value)}
              onChange={() =>
                onChange({
                  ...filters,
                  bydeler: toggleItem(filters.bydeler, value),
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{label}</span>
          </label>
        ))}
      </Section>

      <Section title="Kategori">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() =>
                  onChange({
                    ...filters,
                    categories: toggleItem(filters.categories, cat),
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity"
                style={{
                  background: active ? CATEGORY_COLORS[cat] : "#e5e7eb",
                  color: active ? "#fff" : "#6b7280",
                  opacity: active ? 1 : 0.7,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: CATEGORY_COLORS[cat] }}
                />
                {cat}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Status">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const active = filters.statuses.includes(s);
            return (
              <button
                key={s}
                onClick={() =>
                  onChange({
                    ...filters,
                    statuses: toggleItem(filters.statuses, s),
                  })
                }
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Section>

      {hasPropertyFilters && (
        <button
          onClick={() =>
            onChange({ bydeler: [], categories: [], statuses: [] })
          }
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Nullstill boligfiltre
        </button>
      )}

      <div className="border-t border-white/20 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Næring
          </h3>
          <ToggleSwitch
            checked={storeFilters.enabled}
            onChange={() =>
              onStoreFiltersChange({
                ...storeFilters,
                enabled: !storeFilters.enabled,
              })
            }
            label="Vis på kart"
          />
        </div>

        {storeFilters.enabled && (
          <>
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Butikk-kategori</span>
              <div className="flex flex-wrap gap-1">
                {STORE_CATEGORIES.map((cat) => {
                  const active = storeFilters.categories.includes(cat);
                  const color = STORE_CATEGORY_COLORS[cat] ?? "#6b7280";
                  return (
                    <button
                      key={cat}
                      onClick={() =>
                        onStoreFiltersChange({
                          ...storeFilters,
                          categories: toggleItem(storeFilters.categories, cat),
                        })
                      }
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-opacity"
                      style={{
                        background: active ? color : "#f3f4f6",
                        color: active ? "#fff" : "#6b7280",
                        opacity: active ? 1 : 0.7,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: color }}
                      />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min. omsetning</span>
                <span className="font-medium font-mono tabular-nums text-gray-700">
                  {storeFilters.minRevenue > 0
                    ? `${formatNumber(storeFilters.minRevenue)} kr`
                    : "Alle"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_REVENUE}
                step={1000000}
                value={storeFilters.minRevenue}
                onChange={(e) =>
                  onStoreFiltersChange({
                    ...storeFilters,
                    minRevenue: Number(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0</span>
                <span>140M</span>
              </div>
            </div>

            {hasStoreFilters && (
              <button
                onClick={() =>
                  onStoreFiltersChange({
                    ...storeFilters,
                    categories: [],
                    minRevenue: 0,
                  })
                }
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-800"
              >
                Nullstill næringsfiltre
              </button>
            )}
          </>
        )}
      </div>

      {hasAnyFilter && (
        <button
          onClick={() => {
            onChange({ bydeler: [], categories: [], statuses: [] });
            onStoreFiltersChange({
              ...storeFilters,
              categories: [],
              minRevenue: 0,
            });
          }}
          className="w-full text-xs text-red-500 hover:text-red-700 py-2 border-t border-white/20"
        >
          Nullstill alle filtre
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
