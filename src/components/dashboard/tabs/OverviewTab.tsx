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
import type { Property } from "../../../types/property";
import type { Developer } from "../../../types/developer";
import { CATEGORY_COLORS } from "../../../constants/designSystem";
import { formatNumber } from "../../../utils/format";
import MetricCard from "../../ui/MetricCard";
import ChartCard from "../../ui/ChartCard";
import keyMetrics from "../../../data/plaace/keyMetrics.json";
import visitorsData from "../../../data/plaace/visitors.json";
import demographicsData from "../../../data/plaace/demographics.json";
import developers from "../../../data/developers.json";
import type { DemographicsData, VisitorsData } from "../../../types/plaace";

const demographics = demographicsData as DemographicsData;
const visitors = visitorsData as VisitorsData;

const typedDevelopers = developers as Developer[];

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

type Props = {
  properties: Property[];
};

export default function OverviewTab({ properties }: Props) {
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

  const quarterlyTotals = visitors.quarterly.map((q) => ({
    quarter: q.quarter,
    total: q.visitors2025 + q.work2025 + q.home2025,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <MetricCard
          label="Butikker"
          value={String(keyMetrics.cardTransactions.totalStores)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Utviklere" value={String(typedDevelopers.length)} />
        <MetricCard
          label="Totalt ansatte"
          value={formatNumber(totalEmployees)}
        />
        <MetricCard label="Styreroller" value={String(totalRoles)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <ChartCard title="Besøk per kvartal (2025)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={quarterlyTotals}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Area
                type="monotone"
                dataKey="total"
                name="Daglig snitt"
                stroke="#8b5cf6"
                fill="#8b5cf680"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Aldersfordeling (Plaace)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={demographics.ageDistribution.map((d) => ({
              group: d.group,
              total: d.male + d.female,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="group" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="total"
              name="Antall"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
