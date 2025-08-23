// HabitChart.js
import React from 'react';
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
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
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
          <CartesianGrid strokeDasharray="3 3" />
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
            stroke="#888"
            strokeDasharray="6 3"
            label={{
              value: "Baseline Target",
              position: "insideTopLeft",
              fontSize: 14,
              fill: "#888",
            }}
          />
          <Bar
            dataKey="baselineBar"
            stackId="a"
            fill="#3c5ef8ff"
            name="Baseline (P1)"
          />
          <Bar
            dataKey="reachGreenBar"
            stackId="a"
            fill="#22bb33"
            name="Reach (P2) to Baseline"
          />
          <Bar
            dataKey="reachYellowBar"
            stackId="a"
            fill="#fabf52ff"
            name="Reach (P2) above Baseline"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
