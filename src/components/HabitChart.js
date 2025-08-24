// HabitChart.js
import React from 'react';
import theme from "../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export default function HabitChart({ data, title }) {
  // Always use p1Percent for baselineBar
  const chartData = data.map((d) => {
    const baselineBar = d.p1Percent ?? 0;
    const reachScaled = d.reachScaled ?? 0;
    const reachGreenBar = Math.max(0, Math.min(reachScaled, 100 - baselineBar));
    const reachYellowBar = Math.max(0, reachScaled - reachGreenBar);
    return {
      ...d,
      baselineBar,
      reachGreenBar,
      reachYellowBar,
    };
  });

  // Find max value for dynamic axis
  const maxValue = Math.max(
    100,
    ...chartData.map((d) => d.baselineBar + d.reachGreenBar + d.reachYellowBar)
  );
  const maxY = Math.min(Math.ceil(maxValue / 10) * 10, 200);

  return (
    <div
      style={{
        width: "100%",
        height: 340,
        background: theme.colors.background,
        borderRadius: 12,
        boxShadow: theme.colors.shadow,
        padding: 16,
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontWeight: 600 }}>{title}</h3>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, maxY]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) =>
              value == null ? "-" : `${Number(value).toFixed(1)}%`
            }
          />
          <ReferenceLine
            y={100}
            stroke={theme.colors.textSecondary}
            strokeDasharray="6 3"
            label={{
              value: "Baseline Target",
              position: "insideTopLeft",
              fontSize: 14,
              fill: theme.colors.textSecondary,
            }}
          />
          <Bar
            dataKey="baselineBar"
            stackId="a"
            fill={theme.colors.p1}
            name="Baseline (P1)"
          />
          <Bar
            dataKey="reachGreenBar"
            stackId="a"
            fill={theme.colors.p2Below100}
            name="Reach (P2) to Baseline"
          />
          <Bar
            dataKey="reachYellowBar"
            stackId="a"
            fill={theme.colors.p2Above100}
            name="Reach (P2) above Baseline"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
