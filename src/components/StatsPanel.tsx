import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import type { Property } from "../types/property";
import type { Developer } from "../types/developer";
import { CATEGORY_COLORS } from "../constants/designSystem";
import { formatNumber } from "../utils/format";
import visitors from "../data/plaace/visitors.json";
import demographics from "../data/plaace/demographics.json";
import keyMetrics from "../data/plaace/keyMetrics.json";
import developers from "../data/developers.json";

const typedDevelopers = developers as Developer[];

type Props = {
  properties: Property[];
};

const BYDEL_LABELS: Record<string, string> = {
  Sundland: "Sundland",
  Stromsoe: "Strømsø",
  Groenland: "Grønland",
  Tangen: "Tangen",
};

const STATUS_COLORS: Record<string, string> = {
  Ferdigstilt: "#16a34a",
  "Under bygging": "#3b82f6",
  Planlagt: "#d97706",
  Regulering: "#8b5cf6",
  Konsept: "#94a3b8",
};

export default function StatsPanel({ properties }: Props) {
  const bydelData = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach((p) => {
      const label = BYDEL_LABELS[p.bydel] ?? p.bydel;
      map.set(label, (map.get(label) ?? 0) + (p.units ?? 0));
    });
    return Array.from(map, ([name, units]) => ({ name, units }));
  }, [properties]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach((p) => {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, [properties]);

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach((p) => {
      map.set(p.status, (map.get(p.status) ?? 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({ name, count }));
  }, [properties]);

  const developerData = useMemo(() => {
    return typedDevelopers
      .filter((d) => d.employees != null && d.employees > 0)
      .map((d) => ({
        name: d.name.length > 20 ? d.name.slice(0, 18) + "..." : d.name,
        employees: d.employees,
        roles: d.roles.length,
      }))
      .sort((a, b) => (b.employees ?? 0) - (a.employees ?? 0))
      .slice(0, 8);
  }, []);

  const industryData = useMemo(() => {
    const map = new Map<string, number>();
    typedDevelopers.forEach((d) => {
      const label = d.industry ?? "Ukjent";
      map.set(label, (map.get(label) ?? 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({
      name: name.length > 25 ? name.slice(0, 23) + "..." : name,
      count,
    }));
  }, []);

  const totalEmployees = typedDevelopers.reduce(
    (sum, d) => sum + (d.employees ?? 0),
    0,
  );
  const totalRoles = typedDevelopers.reduce(
    (sum, d) => sum + d.roles.length,
    0,
  );

  return (
    <div className="p-6 space-y-8 overflow-auto h-full">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Befolkning"
          value={formatNumber(keyMetrics.demography.population)}
        />
        <MetricCard
          label="Tetthet (per km²)"
          value={formatNumber(keyMetrics.demography.density)}
        />
        <MetricCard
          label="Daglige besøk"
          value={formatNumber(keyMetrics.movement.dailyVisits)}
        />
        <MetricCard label="Utviklere" value={String(typedDevelopers.length)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Totalt ansatte"
          value={formatNumber(totalEmployees)}
        />
        <MetricCard label="Styreroller" value={String(totalRoles)} />
        <MetricCard label="Bransjer" value={String(industryData.length)} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Enheter per bydel">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bydelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fordeling per kategori">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {categoryData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={
                      CATEGORY_COLORS[d.name as keyof typeof CATEGORY_COLORS] ??
                      "#94a3b8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Prosjekter per status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {statusData.map((d) => (
                  <Cell
                    key={d.name}
                    fill={STATUS_COLORS[d.name] ?? "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Besøkstrender (Plaace)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={visitors.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#8b5cf6"
                fill="#8b5cf680"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Aldersfordeling (Plaace)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={demographics.ageDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="group" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              name="Antall"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Ansatte per utvikler (Brreg)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={developerData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10 }}
                width={130}
              />
              <Tooltip />
              <Bar
                dataKey="employees"
                name="Ansatte"
                fill="#0ea5e9"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bransjefordeling (Brreg)">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={industryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
              >
                {industryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      ["#3b82f6", "#16a34a", "#d97706", "#8b5cf6", "#ef4444"][
                        i % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}
