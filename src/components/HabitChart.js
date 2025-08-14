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
} from "recharts";

export default function HabitChart({ data, title }) {
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
        <LineChart
          data={data}
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
              value == null ? "-" : `${value.toFixed(1)}%`
            }
          />
          {/* Horizontal reference line at 100% */}
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
          {/* Baseline Target Line */}
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#228B22"
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Baseline (P1)"
          />
          {/* Reach Area (fill between baseline and reach) */}
          <Area
            type="monotone"
            dataKey="reach"
            stroke="#fc5200"
            fill="#fc520033"
            name="Reach (P2)"
          />
          {/* Combined Line (optional) */}
          <Line
            type="monotone"
            dataKey="combined"
            stroke="#FFA500"
            strokeWidth={2}
            dot={false}
            name="Baseline + Reach (P1+P2)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
  // ...existing code...
}
