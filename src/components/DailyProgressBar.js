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
  const baselineHabits = habits.filter(
    (h) => h.type === "P1" && h.frequency.timesPerWeek === 7
  );
  const reachHabits = habits.filter(
    (h) => h.type === "P2" && h.frequency.timesPerWeek === 7
  );

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
  const p2Percent = p2Total === 0 ? 0 : (p2Completed / p2Total) * 100;

  // Combined scaled reach
  const reachScaled = p2Percent * (p1Percent / 100);
  const totalPercent = Math.min(p1Percent + reachScaled, 200);

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
        padding: 12,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
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
            domain={[0, 100]}
            tickFormatter={(t) => `${t}%`}
            tick={{ fontSize: 12 }}
            axisLine={false}
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
            fill={theme.colors.accent}
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
