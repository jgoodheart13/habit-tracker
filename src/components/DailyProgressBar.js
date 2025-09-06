// DailyProgressBar.js
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
  LabelList,
} from "recharts";

export default function DailyProgressBar({ habits, activeDate }) {
  // Only daily habits
  const baselineHabits = habits.filter(
    (h) => h.type === "P1" && h.frequency.daily
  );
  const reachHabits = habits.filter(
    (h) => h.type === "P2" && h.frequency.daily
  );
  // Calculate for the given day
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
  // Inverse relationship: scaled reach
  const reachScaled = p2Percent * (p1Percent / 100);
  let baselineBar = p1Percent;
  let reachGreenBar = Math.max(0, Math.min(reachScaled, 100 - baselineBar));
  let reachYellowBar = Math.max(0, reachScaled - reachGreenBar);
  let totalPercent = baselineBar + reachScaled;
  if (totalPercent >= 100) {
    baselineBar = 0;
    reachGreenBar = 0;
    reachYellowBar = totalPercent;
  }
  const chartData = [
    {
      name: activeDate,
      baselineBar,
      reachGreenBar,
      reachYellowBar,
      total: baselineBar + reachGreenBar + reachYellowBar,
    },
  ];
  const maxPercent = Math.min(
    Math.max(
      100,
      Math.ceil((baselineBar + reachGreenBar + reachYellowBar) / 10) * 10
    ),
    200
  );
  return (
    <div
      style={{
        width: "100%",
        height: 160,
        background: theme.colors.background,
        borderRadius: 12,
        boxShadow: theme.colors.shadow,
        padding: 18,
        marginBottom: 24,
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontWeight: 600 }}>
        Daily Progress
        <span
          style={{
            marginLeft: 12,
            fontSize: 14,
            color: theme.colors.accent,
            background: theme.colors.incomplete,
            borderRadius: 6,
            padding: "2px 8px",
            fontWeight: 700,
          }}
        >
          {activeDate}
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 18, right: 30, left: 10, bottom: 10 }}
          barCategoryGap={16}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={theme.colors.border} />
          <YAxis
            type="category"
            dataKey="name"
            width={0}
            tick={null}
            axisLine={false}
            tickLine={false}
          />
          <XAxis
            type="number"
            domain={[0, maxPercent]}
            tickFormatter={(tick) => {
              // If 100% or more, only show 100% and current percent
              if (totalPercent >= 100) {
                if (tick === 100 || tick === Math.round(totalPercent)) {
                  return `${tick}%`;
                }
                return "";
              }
              return `${tick}%`;
            }}
            ticks={
              totalPercent >= 100 ? [100, Math.round(totalPercent)] : undefined
            }
            tick={{ fontSize: 13 }}
          />
          <ReferenceLine
            x={100}
            stroke={theme.colors.textSecondary}
            strokeDasharray="6 3"
            // label={
            //   totalPercent >= 100
            //     ? null
            //     : {
            //         value: "Baseline Target",
            //         position: "top",
            //         fontSize: 14,
            //         fill: theme.colors.textSecondary,
            //       }
            // }
          />
          <Bar
            dataKey="baselineBar"
            stackId="a"
            fill={theme.colors.p1}
            name="Baseline (P1)"
          >
            <LabelList
              dataKey="baselineBar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
          <Bar
            dataKey="reachGreenBar"
            stackId="a"
            fill={theme.colors.p2Below100}
            name="Reach (P2) to Baseline"
          >
            <LabelList
              dataKey="reachGreenBar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
          <Bar
            dataKey="reachYellowBar"
            stackId="a"
            fill={theme.colors.p2Above100}
            name="Reach (P2) above Baseline"
          >
            <LabelList
              dataKey="reachYellowBar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
