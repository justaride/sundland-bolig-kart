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
import type {
  DemographicsData,
  VisitorsData,
  DrillDownData,
} from "../../../types/plaace";
import { formatNumber, formatCurrency } from "../../../utils/format";
import ChartCard from "../../ui/ChartCard";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#16a34a",
  "#d97706",
  "#ef4444",
  "#0ea5e9",
];

type Props = {
  demographics: DemographicsData;
  visitors: VisitorsData;
  viewMode: "resident" | "visitor";
  onDrillDown: (data: DrillDownData) => void;
};

export default function DemographicsTab({
  demographics,
  visitors,
  viewMode,
  onDrillDown,
}: Props) {
  const ageData =
    viewMode === "resident"
      ? demographics.ageDistribution
      : visitors.ageDistribution;

  const buildingsData =
    viewMode === "resident" ? demographics.buildings : visitors.buildings;

  const householdsData =
    viewMode === "resident" ? demographics.households : visitors.households;

  const incomeData =
    viewMode === "resident" ? demographics.incomeDistribution : visitors.income;

  const medianData =
    viewMode === "resident" ? demographics.medianIncome : visitors.medianIncome;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Aldersfordeling">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={ageData}
              onClick={(e: any) => {
                if (e?.activePayload?.[0]) {
                  onDrillDown({
                    type: "ageGroup",
                    payload: {
                      group: e.activePayload[0].payload.group,
                      resident: demographics.ageDistribution.find(
                        (a) => a.group === e.activePayload[0].payload.group,
                      ),
                      visitor: visitors.ageDistribution.find(
                        (a) => a.group === e.activePayload[0].payload.group,
                      ),
                    },
                  });
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="group" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
              <Bar
                dataKey="male"
                name="Menn"
                fill="#3b82f6"
                stackId="a"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="female"
                name="Kvinner"
                fill="#ec4899"
                stackId="a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Boligtyper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={buildingsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="type"
                type="category"
                tick={{ fontSize: 11 }}
                width={110}
              />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Husholdninger">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={householdsData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                label={(props: any) =>
                  `${props.type.length > 15 ? props.type.slice(0, 13) + "..." : props.type} (${formatNumber(props.count)})`
                }
                labelLine={false}
              >
                {householdsData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inntektsfordeling">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={incomeData}
              onClick={(e: any) => {
                if (e?.activePayload?.[0]) {
                  const bracket = e.activePayload[0].payload.bracket;
                  onDrillDown({
                    type: "income",
                    payload: {
                      bracket,
                      resident: demographics.incomeDistribution.find(
                        (i) => i.bracket === bracket,
                      ),
                      visitor: visitors.income.find(
                        (i) => i.bracket === bracket,
                      ),
                      medianResident: demographics.medianIncome,
                      medianVisitor: visitors.medianIncome,
                    },
                  });
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="bracket"
                tick={{ fontSize: 9 }}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Medianinntekt per husholdningstype">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={medianData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <YAxis
                dataKey="type"
                type="category"
                tick={{ fontSize: 10 }}
                width={140}
              />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="amount" fill="#d97706" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Befolkningstrend">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={demographics.populationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
              <Area
                type="monotone"
                dataKey="population"
                name="Befolkning"
                stroke="#3b82f6"
                fill="#3b82f680"
              />
              <Area
                type="monotone"
                dataKey="trendline"
                name="Trendlinje"
                stroke="#94a3b8"
                fill="none"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
