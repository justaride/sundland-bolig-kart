import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { CommerceData, Store, DrillDownData } from "../../../types/plaace";
import ChartCard from "../../ui/ChartCard";
import DataTable from "../../ui/DataTable";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#16a34a",
  "#d97706",
  "#ef4444",
  "#0ea5e9",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#06b6d4",
  "#e11d48",
  "#a855f7",
  "#22c55e",
  "#eab308",
  "#f43f5e",
];

type Props = {
  commerce: CommerceData;
  onDrillDown: (data: DrillDownData) => void;
};

const storeColumns = [
  {
    key: "rank",
    label: "#",
    render: (s: Store) => s.rank,
    sortValue: (s: Store) => s.rank,
    align: "right" as const,
  },
  {
    key: "name",
    label: "Navn",
    render: (s: Store) => <span className="font-medium">{s.name}</span>,
    sortValue: (s: Store) => s.name,
  },
  {
    key: "category",
    label: "Kategori",
    render: (s: Store) => <span className="text-gray-500">{s.category}</span>,
  },
  {
    key: "revenue",
    label: "Omsetning",
    render: (s: Store) => {
      if (s.revenue >= 1000000)
        return `${Math.round(s.revenue / 1000000)} mill.`;
      if (s.revenue >= 1000) return `${Math.round(s.revenue / 1000)}k`;
      return String(s.revenue);
    },
    sortValue: (s: Store) => s.revenue,
    align: "right" as const,
  },
  {
    key: "yoyGrowth",
    label: "Vekst",
    render: (s: Store) => {
      if (s.yoyGrowth === null) return "–";
      const color = s.yoyGrowth >= 0 ? "text-green-600" : "text-red-600";
      return <span className={color}>{s.yoyGrowth}%</span>;
    },
    sortValue: (s: Store) => s.yoyGrowth ?? 0,
    align: "right" as const,
  },
  {
    key: "employees",
    label: "Ansatte",
    render: (s: Store) => s.employees,
    sortValue: (s: Store) => s.employees,
    align: "right" as const,
  },
  {
    key: "marketShare",
    label: "Andel",
    render: (s: Store) => `${s.marketShare}%`,
    sortValue: (s: Store) => s.marketShare,
    align: "right" as const,
  },
];

export default function CommerceTab({ commerce, onDrillDown }: Props) {
  const l1Groups = commerce.categoryMix.reduce(
    (acc, item) => {
      const existing = acc.find((g) => g.name === item.level1);
      if (existing) {
        existing.value += item.percentage;
        existing.children.push({ name: item.level2, value: item.percentage });
      } else {
        acc.push({
          name: item.level1,
          value: item.percentage,
          children: [{ name: item.level2, value: item.percentage }],
        });
      }
      return acc;
    },
    [] as {
      name: string;
      value: number;
      children: { name: string; value: number }[];
    }[],
  );

  return (
    <div className="space-y-6">
      <ChartCard title="Butikker (estimert omsetning)">
        <DataTable
          data={commerce.stores}
          columns={storeColumns}
          onRowClick={(s) =>
            onDrillDown({
              type: "store",
              payload: s as unknown as Record<string, unknown>,
            })
          }
          pageSize={15}
        />
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Konseptmiks">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={l1Groups}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
                labelLine={false}
              >
                {l1Groups.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Kjeder vs. uavhengige">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={commerce.chainVsIndependent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="chain"
                name="Kjeder"
                stroke="#3b82f6"
                fill="#3b82f680"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="independent"
                name="Uavhengige"
                stroke="#16a34a"
                fill="#16a34a80"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Over/underrepresentasjon vs. kommune">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={commerce.overUnderRepresentation} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
            <YAxis
              dataKey="category"
              type="category"
              tick={{ fontSize: 11 }}
              width={140}
            />
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {commerce.overUnderRepresentation.map((d, i) => (
                <Cell key={i} fill={d.value >= 0 ? "#16a34a" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
