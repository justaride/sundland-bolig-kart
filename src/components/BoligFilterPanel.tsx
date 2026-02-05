import type { Filters } from "../hooks/useFilteredProperties";
import { CATEGORY_COLORS } from "../constants/designSystem";
import { BYDELER, CATEGORIES, STATUSES } from "../constants/labels";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalCount: number;
  filteredCount: number;
};

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default function BoligFilterPanel({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: Props) {
  const hasFilters =
    filters.bydeler.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0;

  return (
    <div className="p-4 space-y-5 text-sm">
      <div className="text-xs text-gray-400 font-mono tabular-nums">
        Viser {filteredCount} / {totalCount}
      </div>

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

      {hasFilters && (
        <button
          onClick={() =>
            onChange({ bydeler: [], categories: [], statuses: [] })
          }
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Nullstill filtre
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
