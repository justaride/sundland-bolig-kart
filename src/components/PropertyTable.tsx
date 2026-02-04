import React, { useState, useMemo } from "react";
import type { Property } from "../types/property";
import type { Developer } from "../types/developer";
import { CATEGORY_COLORS } from "../constants/designSystem";
import { BYDEL_LABELS } from "../constants/labels";
import { formatNumber, formatCurrency, formatSqm } from "../utils/format";
import developers from "../data/developers.json";

const devMap = new Map(
  (developers as Developer[]).map((d) => [d.orgNumber, d]),
);

type Props = {
  properties: Property[];
  onSelectProperty: (id: string) => void;
};

type SortKey =
  | "name"
  | "bydel"
  | "category"
  | "status"
  | "units"
  | "sqmTotal"
  | "pricePerSqm"
  | "developer";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Navn" },
  { key: "bydel", label: "Bydel" },
  { key: "category", label: "Kategori" },
  { key: "status", label: "Status" },
  { key: "units", label: "Enheter", align: "right" },
  { key: "sqmTotal", label: "Areal", align: "right" },
  { key: "pricePerSqm", label: "Pris/m²", align: "right" },
  { key: "developer", label: "Utvikler" },
];

function getSortValue(p: Property, key: SortKey): string | number {
  switch (key) {
    case "developer":
      return p.developer?.name ?? "";
    case "units":
      return p.units ?? 0;
    case "sqmTotal":
      return p.sqmTotal ?? 0;
    case "pricePerSqm":
      return p.pricePerSqm ?? 0;
    default:
      return (p[key] as string) ?? "";
  }
}

export default function PropertyTable({ properties, onSelectProperty }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...properties].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), "nb");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [properties, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`px-3 py-2.5 font-medium text-gray-500 cursor-pointer hover:text-gray-900 select-none ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-gray-400">
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const dev = p.developer?.orgNumber
              ? devMap.get(p.developer.orgNumber)
              : null;
            const isExpanded = expandedId === p.id;
            return (
              <React.Fragment key={p.id}>
                <tr
                  onClick={() => {
                    setExpandedId(isExpanded ? null : p.id);
                    onSelectProperty(p.id);
                  }}
                  className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {BYDEL_LABELS[p.bydel] ?? p.bydel}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs text-white font-medium"
                      style={{ background: CATEGORY_COLORS[p.category] }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">
                    {p.units != null ? formatNumber(p.units) : "–"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">
                    {p.sqmTotal != null ? formatSqm(p.sqmTotal) : "–"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">
                    {p.pricePerSqm != null
                      ? formatCurrency(p.pricePerSqm)
                      : "–"}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {p.developer?.name ?? "–"}
                  </td>
                </tr>
                {isExpanded && dev && (
                  <tr className="bg-gray-50/80">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="flex gap-8 text-xs text-gray-600">
                        <div>
                          <span className="font-medium text-gray-500">
                            Org:
                          </span>{" "}
                          {dev.orgNumber}
                        </div>
                        {dev.employees != null && (
                          <div>
                            <span className="font-medium text-gray-500">
                              Ansatte:
                            </span>{" "}
                            {formatNumber(dev.employees)}
                          </div>
                        )}
                        {dev.industry && (
                          <div>
                            <span className="font-medium text-gray-500">
                              Bransje:
                            </span>{" "}
                            {dev.industry}
                          </div>
                        )}
                      </div>
                      {dev.roles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {dev.roles.slice(0, 5).map((r) => (
                            <span
                              key={r.name}
                              className="inline-block px-2 py-0.5 rounded bg-gray-200 text-xs text-gray-700"
                            >
                              {r.name} — {r.role}
                            </span>
                          ))}
                          {dev.roles.length > 5 && (
                            <span className="text-xs text-gray-400">
                              +{dev.roles.length - 5} til
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
          Ingen prosjekter matcher filtrene
        </div>
      )}
    </div>
  );
}
