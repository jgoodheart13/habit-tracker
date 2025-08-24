// WeeklyProgressChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LabelList } from 'recharts';
import theme from "../styles/theme";

export default function WeeklyProgressChart({ habits, activeDate }) {
  // Only weekly habits
  const weeklyHabits = habits.filter((h) => !h.frequency.daily);
  // Get all days in current week (Monday-Sunday)
  const now = new Date(activeDate);
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  // Format week range label
  const weekLabel = `${weekDays[0].replace(/-/g, "/")}\n${weekDays[6].replace(
    /-/g,
    "/"
  )}`;
  // Calculate P1 and P2 segments
  let totalP1 = 0;
  let totalP2Possible = 0;
  let p1Completed = 0;
  let p2Completed = 0;
  weeklyHabits.forEach((habit) => {
    const n = habit.frequency.timesPerWeek;
    totalP1 += n;
    totalP2Possible += 7 - n;
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length;
    p1Completed += Math.min(completed, n);
    p2Completed += Math.max(completed - n, 0);
  });
  // Calculate percentages
  const p1Percent = totalP1 === 0 ? 0 : (p1Completed / totalP1) * 100;
  const p2Below100Raw =
    totalP2Possible === 0 ? 0 : (p2Completed / totalP2Possible) * 100;
  const p2Below100Percent = Math.max(
    0,
    Math.min(p2Below100Raw, 100 - p1Percent)
  );
  const p2Above100Percent = Math.max(0, p1Percent + p2Below100Raw - 100);
  const chartData = [
    {
      name: weekLabel,
      p1Bar: p1Percent,
      p2Below100Bar: p2Below100Percent,
      p2Above100Bar: p2Above100Percent,
      total: p1Percent + p2Below100Percent + p2Above100Percent,
    },
  ];
  // Calculate dynamic axis domain
  const maxPercent = Math.min(
    Math.max(
      100,
      Math.ceil((p1Percent + p2Below100Percent + p2Above100Percent) / 10) * 10
    ),
    200
  );
  return (
    <div
      style={{
        width: "100%",
        height: 200,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        padding: 28,
        marginBottom: 36,
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontWeight: 600 }}>Weekly Progress</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 38, right: 40, left: 10, bottom: 10 }}
          barCategoryGap={16}
        >
          <CartesianGrid strokeDasharray="6 6" stroke={theme.colors.border} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 16, whiteSpace: "pre-line", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <XAxis
            type="number"
            domain={[0, maxPercent]}
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fontSize: 14 }}
          />
          <Tooltip
            formatter={(value) =>
              value == null ? "-" : `${Number(value).toFixed(1)}%`
            }
          />
          <ReferenceLine
            x={100}
            stroke={theme.colors.textSecondary}
            strokeDasharray="6 3"
            label={{
              value: "Baseline Target",
              position: "top",
              fontSize: 15,
              fill: theme.colors.textSecondary,
            }}
          />
          <Bar
            dataKey="p1Bar"
            stackId="a"
            fill={theme.colors.p1}
            name="P1 Progress"
          >
            <LabelList
              dataKey="p1Bar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
          <Bar
            dataKey="p2Below100Bar"
            stackId="a"
            fill={theme.colors.p2Below100}
            name="P2 to Baseline"
          >
            <LabelList
              dataKey="p2Below100Bar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
          <Bar
            dataKey="p2Above100Bar"
            stackId="a"
            fill={theme.colors.p2Above100}
            name="P2 Above Baseline"
          >
            <LabelList
              dataKey="p2Above100Bar"
              position="top"
              formatter={(v) => (v > 0 ? `${v.toFixed(1)}%` : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
