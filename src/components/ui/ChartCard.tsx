import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function ChartCard({ title, children, action }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
