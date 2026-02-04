import type { Property } from "../types/property";
import { formatNumber, formatCurrency, formatSqm } from "../utils/format";

type Props = {
  properties: Property[];
};

export default function FloatingStats({ properties }: Props) {
  const totalUnits = properties.reduce((sum, p) => sum + (p.units ?? 0), 0);
  const totalSqm = properties.reduce((sum, p) => sum + (p.sqmTotal ?? 0), 0);
  const withPrice = properties.filter((p) => p.pricePerSqm != null);
  const avgPrice =
    withPrice.length > 0
      ? Math.round(
          withPrice.reduce((sum, p) => sum + p.pricePerSqm!, 0) /
            withPrice.length,
        )
      : null;

  const stats = [
    { label: "Prosjekter", value: String(properties.length) },
    { label: "Enheter", value: formatNumber(totalUnits) },
    { label: "Totalt areal", value: formatSqm(totalSqm) },
    ...(avgPrice != null
      ? [{ label: "Snitt pris/m²", value: formatCurrency(avgPrice) }]
      : []),
  ];

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 pointer-events-none">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-100 pointer-events-auto"
        >
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">
            {s.label}
          </div>
          <div className="text-sm font-semibold text-gray-900">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
