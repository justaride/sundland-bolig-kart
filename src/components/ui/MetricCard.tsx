type Props = {
  label: string;
  value: string;
  subtitle?: string;
};

export default function MetricCard({ label, value, subtitle }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}
