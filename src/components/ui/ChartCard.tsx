import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function ChartCard({
  title,
  subtitle,
  badge,
  children,
  action,
}: Props) {
  return (
    <div className="chart-card glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-600">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
