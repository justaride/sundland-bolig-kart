import { useMemo } from "react";
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
import type {
  GrowthData,
  CardTransactionsData,
  DrillDownData,
} from "../../../types/plaace";
import ChartCard from "../../ui/ChartCard";

type Props = {
  growth: GrowthData;
  cardTransactions: CardTransactionsData;
  onDrillDown: (data: DrillDownData) => void;
};

export default function GrowthTab({
  growth,
  cardTransactions,
  onDrillDown,
}: Props) {
  const indexedDownsampled = useMemo(() => {
    const data = growth.indexedGrowth;
    if (data.length <= 365) return data;
    const step = Math.ceil(data.length / 365);
    return data.filter((_, i) => i % step === 0);
  }, [growth.indexedGrowth]);

  const years = Object.keys(cardTransactions.byWeekday[0] || {}).filter(
    (k) => k !== "day",
  );

  const YEAR_COLORS: Record<string, string> = {
    "2019": "#94a3b8",
    "2020": "#64748b",
    "2021": "#0ea5e9",
    "2022": "#8b5cf6",
    "2023": "#3b82f6",
    "2024": "#16a34a",
    "2025": "#d97706",
    "2026": "#ef4444",
  };

  return (
    <div className="space-y-6">
      <ChartCard title="Årlig vekst (%)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={growth.annualGrowth}
            onClick={(e) => {
              if (e?.activePayload?.[0]) {
                const row = e.activePayload[0].payload;
                onDrillDown({
                  type: "growth",
                  payload: {
                    year: row.year,
                    gulskogen: { pct: row.gulskogenPct, nok: row.gulskogenNok },
                    drammen: { pct: row.drammenPct, nok: row.drammenNok },
                    norway: { pct: row.norwayPct, nok: row.norwayNok },
                  },
                });
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Legend />
            <Bar dataKey="gulskogenPct" name="Gulskogen" fill="#3b82f6" />
            <Bar dataKey="drammenPct" name="Drammen" fill="#8b5cf6" />
            <Bar dataKey="norwayPct" name="Norge" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Indeksert vekst (indeks = 100)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={indexedDownsampled}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(d) => {
                const [y, m] = d.split("-");
                return `${m}/${y.slice(2)}`;
              }}
              minTickGap={60}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(d) => String(d)}
              formatter={(v: number) => v.toFixed(1)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Utvikling per år (mNOK)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth.categoryDevelopment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)} mNOK`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="dining"
                name="Mat og opplevelser"
                stroke="#d97706"
                fill="#d9770640"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="services"
                name="Tjenester"
                stroke="#16a34a"
                fill="#16a34a40"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="retail"
                name="Handel"
                stroke="#3b82f6"
                fill="#3b82f640"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Korthandel (ukentlig, mNOK)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={cardTransactions.weekly}
              onClick={(e) => {
                if (e?.activePayload?.[0]) {
                  const row = e.activePayload[0].payload;
                  onDrillDown({
                    type: "cardTransaction",
                    payload: {
                      week: row.week,
                      amount: row.amount,
                      date: row.date,
                    },
                  });
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => {
                  if (!d) return "";
                  const [y, m] = d.split("-");
                  return `${m}/${y?.slice(2)}`;
                }}
                minTickGap={60}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.week ?? ""
                }
                formatter={(v: number) => `${v} mNOK`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Korthandel per ukedag (mNOK)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={cardTransactions.byWeekday}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v} mNOK`} />
            <Legend />
            {years.map((year) => (
              <Bar
                key={year}
                dataKey={year}
                name={year}
                fill={YEAR_COLORS[year] ?? "#94a3b8"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
