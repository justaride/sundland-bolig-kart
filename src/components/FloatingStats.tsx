import type { Property } from "../types/property";
import { formatNumber, formatCurrency, formatSqm } from "../utils/format";
import MetricPill from "./ui/MetricPill";

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

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none animate-fade-slide-in">
      <div className="pointer-events-auto">
        <MetricPill
          label="Prosjekter"
          value={String(properties.length)}
          variant="hero"
        />
      </div>
      <div className="pointer-events-auto">
        <MetricPill label="Enheter" value={formatNumber(totalUnits)} />
      </div>
      <div className="pointer-events-auto">
        <MetricPill label="Totalt areal" value={formatSqm(totalSqm)} />
      </div>
      {avgPrice != null && (
        <div className="pointer-events-auto">
          <MetricPill label="Snitt pris/m²" value={formatCurrency(avgPrice)} />
        </div>
      )}
    </div>
  );
}
