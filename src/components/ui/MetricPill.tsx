type Variant = "hero" | "secondary" | "positive" | "warning";

type Props = {
  label: string;
  value: string;
  subtitle?: string;
  variant?: Variant;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  hero: "stat-card-hero rounded-xl p-4",
  secondary: "glass-panel rounded-xl p-4",
  positive: "glass-panel rounded-xl p-4 border-l-4 border-l-green-500",
  warning: "glass-panel rounded-xl p-4 border-l-4 border-l-amber-500",
};

export default function MetricPill({
  label,
  value,
  subtitle,
  variant = "secondary",
}: Props) {
  const isHero = variant === "hero";

  return (
    <div className={VARIANT_CLASSES[variant]}>
      <div
        className={`text-xs uppercase tracking-widest ${isHero ? "text-white/70" : "text-gray-400"}`}
      >
        {label}
      </div>
      <div
        className={`text-xl font-semibold font-mono tabular-nums mt-1 relative z-10 ${isHero ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </div>
      {subtitle && (
        <div
          className={`text-xs mt-0.5 ${isHero ? "text-white/60" : "text-gray-400"}`}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
