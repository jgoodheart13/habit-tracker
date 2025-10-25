import React from "react";
import theme from "../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function ProgressGraph({
  primaryPercentage,
  secondaryPercentage,
}) {
  const chartData = [
    {
      primary: primaryPercentage,
      secondary: secondaryPercentage,
    },
  ]

  return (
    <div
      style={{
        width: "92%",
        background: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        padding: 28,
      }}
    >
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fontSize: 12 }}
          />
          <Bar
            dataKey="primary"
            fill={theme.colors.p1}
            name="Primary Progress"
          />
          <Bar
            dataKey="secondary"
            fill={theme.colors.p2Below100}
            name="Secondary Progress"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}