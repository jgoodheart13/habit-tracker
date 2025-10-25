import React from "react";
import theme from "../styles/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function ProgressGraph({
  primaryPercentage,
  secondaryPercentage,
}) {
  const chartData = [
    {
      name: "Progress", // Added name for better debugging
      primary: primaryPercentage, // Hardcoded value for testing
      secondary: secondaryPercentage, // Hardcoded value for testing
    },
  ]

  console.log("Chart Data:", chartData) // Debugging log
  return (
    <div
      style={{
        width: "92%",
        background: "#fff",
        borderRadius: 12,
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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(tick) => `${tick}%`}
          />
          <YAxis type="category" dataKey="name" />
          <Bar dataKey="primary" stackId="progress" fill="#007bff" />
          <Bar dataKey="secondary" stackId="progress" fill="#7ec8ff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}