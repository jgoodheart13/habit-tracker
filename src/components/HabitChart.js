// HabitChart.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ReferenceLine,
  ComposedChart,
} from "recharts";

export default function HabitChart({ data, title }) {
  const chartData = data.map((d) => ({
    ...d,
    delta: Math.max(0, (d.combined ?? 0) - (d.baseline ?? 0)),
  }));

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
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 200]}
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

          {/* stack areas: green up to baseline, yellow only above it */}
          <Area
            type="monotone"
            dataKey="baseline"
            stackId="1"
            stroke="none"
            fill="#3c5ef8ff"
            fillOpacity={0.25}
            // name="Baseline (P1)"
          />
          <Area
            type="monotone"
            dataKey="delta"
            stackId="1"
            stroke="none"
            fill="#fabf52ff"
            fillOpacity={0.25}
            // name="Baseline + Reach (P1+P2)"
          />

          {/* lines on top */}
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#3c5ef8ff"
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Baseline (P1)"
          />
          <Line
            type="monotone"
            dataKey="combined"
            stroke="#fabf52ff"
            strokeWidth={2}
            dot={false}
            name="Baseline + Reach (P1+P2)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
  // ...existing code...
}
