import React from "react";
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
  LabelList,
} from "recharts";

export default function DailyProgressBar({ habits, activeDate }) {
  // Filter daily habits
  const baselineHabits = habits.filter((h) => h.type === "P1");
  const reachHabits = habits.filter((h) => h.type === "P2");

  // Calculate completion %
  const p1Total = baselineHabits.length;
  const p1Completed = baselineHabits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length;
  const p1Percent = p1Total === 0 ? 0 : (p1Completed / p1Total) * 100;

  const p2Total = reachHabits.length;
  const p2Completed = reachHabits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length;
  const p2Percent =
    p2Total === 0 ? 0 : (p2Completed / Math.max(p1Total, p2Total)) * p1Percent;

  // Combined scaled reach
  const totalPercent = p1Percent + p2Percent; // Ensure totalPercent is calculated correctly

  // Define maxPercent for the Y-axis domain
  let maxPercent = totalPercent > 100 ? Math.ceil(totalPercent / 10) * 10 : 100; // Dynamically adjust maxPercent
  maxPercent = Math.min(maxPercent, 200); // Ensure theoretical maximum of 200%

  // Chart data — just one bar
  const chartData = [
    {
      day: "Today",
      percent: totalPercent,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        background: theme.colors.background,
        borderRadius: 12,
        boxShadow: theme.colors.shadow,
        paddingTop: 12,
      }}
    >
      <ResponsiveContainer width="100%" height="100%" overflow="visible">
        <BarChart
          data={chartData}
          layout="horizontal" // Vertical bar (Y = %)
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
          {/* X-axis: hidden, no categories */}
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={false} />
          {/* Y-axis: shows % scale */}
          <YAxis
            type="number"
            domain={[0, maxPercent]}
            tick={null} // Remove redundant tick marks
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value.toFixed(1)}%`, "Progress"]}
          />
          <ReferenceLine
            y={100}
            stroke={theme.colors.textSecondary}
            strokeDasharray="6 3"
          />
          <Bar
            dataKey="percent"
            fill={
              totalPercent >= 100
                ? theme.colors.p2Above100
                : theme.colors.p2Below100
            } // Use theme colors for bar fill
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="percent"
              position="top"
              formatter={(v) => `${v.toFixed(1)}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
