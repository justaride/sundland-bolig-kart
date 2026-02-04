import type { Filters } from "../hooks/useFilteredProperties";
import type {
  Bydel,
  PropertyCategory,
  DevelopmentStatus,
} from "../types/property";
import { CATEGORY_COLORS } from "../constants/designSystem";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const BYDELER: { value: Bydel; label: string }[] = [
  { value: "Sundland", label: "Sundland" },
  { value: "Stromsoe", label: "Strømsø" },
  { value: "Groenland", label: "Grønland" },
  { value: "Tangen", label: "Tangen" },
];

const CATEGORIES: PropertyCategory[] = [
  "Rekkehus",
  "Leilighet",
  "Enebolig",
  "Naering",
  "Offentlig",
  "Under utvikling",
];

const STATUSES: DevelopmentStatus[] = [
  "Ferdigstilt",
  "Under bygging",
  "Planlagt",
  "Regulering",
  "Konsept",
];

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default function FilterPanel({ filters, onChange }: Props) {
  return (
    <div className="p-4 space-y-5 text-sm">
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
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-opacity"
                style={{
                  background: active ? CATEGORY_COLORS[cat] : "#e5e7eb",
                  color: active ? "#fff" : "#6b7280",
                  opacity: active ? 1 : 0.7,
                }}
              >
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

      {(filters.bydeler.length > 0 ||
        filters.categories.length > 0 ||
        filters.statuses.length > 0) && (
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
