import type { StoreFilters } from "../types/store";
import { STORE_CATEGORY_COLORS, MAX_REVENUE } from "../constants/designSystem";
import { STORE_CATEGORIES } from "../constants/labels";
import { formatNumber } from "../utils/format";

type Props = {
  filters: StoreFilters;
  onChange: (filters: StoreFilters) => void;
  totalCount: number;
  filteredCount: number;
};

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default function NaeringFilterPanel({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: Props) {
  const hasFilters = filters.categories.length > 0 || filters.minRevenue > 0;

  return (
    <div className="p-4 space-y-5 text-sm">
      <div className="text-xs text-gray-400 font-mono tabular-nums">
        Viser {filteredCount} / {totalCount}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Butikk-kategori
        </h3>
        <div className="flex flex-wrap gap-1">
          {STORE_CATEGORIES.map((cat) => {
            const active = filters.categories.includes(cat);
            const color = STORE_CATEGORY_COLORS[cat] ?? "#6b7280";
            return (
              <button
                key={cat}
                onClick={() =>
                  onChange({
                    ...filters,
                    categories: toggleItem(filters.categories, cat),
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

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Min. omsetning</span>
          <span className="font-medium font-mono tabular-nums text-gray-700">
            {filters.minRevenue > 0
              ? `${formatNumber(filters.minRevenue)} kr`
              : "Alle"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_REVENUE}
          step={1000000}
          value={filters.minRevenue}
          onChange={(e) =>
            onChange({ ...filters, minRevenue: Number(e.target.value) })
          }
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>0</span>
          <span>140M</span>
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() =>
            onChange({ ...filters, categories: [], minRevenue: 0 })
          }
          className="text-xs text-emerald-600 hover:text-emerald-800"
        >
          Nullstill filtre
        </button>
      )}
    </div>
  );
}
