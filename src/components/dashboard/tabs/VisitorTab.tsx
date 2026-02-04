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
  LineChart,
  Line,
} from "recharts";
import type { VisitorsData, DrillDownData } from "../../../types/plaace";
import { formatNumber } from "../../../utils/format";
import ChartCard from "../../ui/ChartCard";

type Props = {
  visitors: VisitorsData;
  onDrillDown: (data: DrillDownData) => void;
};

export default function VisitorTab({ visitors, onDrillDown }: Props) {
  const topOrigins = visitors.origins.slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Besøk per time (daglig gjennomsnitt)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={visitors.hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Besøkende"
                stroke="#3b82f6"
                fill="#3b82f640"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="work"
                name="På jobb"
                stroke="#d97706"
                fill="#d9770640"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="home"
                name="Hjemme"
                stroke="#16a34a"
                fill="#16a34a40"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Besøk per ukedag">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={visitors.weekday}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
              <Bar dataKey="visitors" name="Besøkende" fill="#3b82f6" />
              <Bar dataKey="work" name="På jobb" fill="#d97706" />
              <Bar dataKey="home" name="Hjemme" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bevegelsesmønster (kvartalsvis)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={visitors.quarterly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatNumber(Number(v))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors2023"
                name="Besøkende 2023"
                stroke="#94a3b8"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="visitors2024"
                name="Besøkende 2024"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="visitors2025"
                name="Besøkende 2025"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Områder besøkende kommer fra (topp 20)">
          <ResponsiveContainer width="100%" height={480}>
            <BarChart
              data={topOrigins}
              layout="vertical"
              onClick={(e) => {
                if (e?.activePayload?.[0]) {
                  const origin = e.activePayload[0].payload;
                  onDrillDown({
                    type: "origin",
                    payload: {
                      area: origin.area,
                      visits: origin.visits,
                      percentage: origin.percentage,
                    },
                  });
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis
                dataKey="area"
                type="category"
                tick={{ fontSize: 9 }}
                width={160}
              />
              <Tooltip
                formatter={(v: number) => formatNumber(v)}
                labelFormatter={(l) => String(l)}
              />
              <Bar
                dataKey="visits"
                name="Besøk"
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
