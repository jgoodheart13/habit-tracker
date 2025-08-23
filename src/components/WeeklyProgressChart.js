// WeeklyProgressChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LabelList } from 'recharts';

export default function WeeklyProgressChart({ habits, activeDate }) {
  // Only weekly habits
  const weeklyHabits = habits.filter(h => !h.frequency.daily);
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
  const weekLabel = `${weekDays[0].replace(/-/g, '/')}\n${weekDays[6].replace(/-/g, '/')}`;
  // Calculate blue and yellow segments
  let totalN = 0;
  let totalP2Possible = 0;
  let blueCompleted = 0;
  let yellowCompleted = 0;
  weeklyHabits.forEach(habit => {
    const n = habit.frequency.timesPerWeek;
    totalN += n;
    totalP2Possible += (7 - n);
    const completed = weekDays.filter(d => habit.completedDates.includes(d)).length;
    blueCompleted += Math.min(completed, n);
    yellowCompleted += Math.max(completed - n, 0);
  });
  // Calculate percentages
  const bluePercent = totalN === 0 ? 0 : (blueCompleted / totalN) * 100;
  const greenPercentRaw = totalP2Possible === 0 ? 0 : (yellowCompleted / totalP2Possible) * 100;
  const greenPercent = Math.max(0, Math.min(greenPercentRaw, 100 - bluePercent));
  const yellowPercent = Math.max(0, bluePercent + greenPercentRaw - 100);
  const chartData = [{
    name: weekLabel,
    blueBar: bluePercent,
    greenBar: greenPercent,
    yellowBar: yellowPercent,
    total: bluePercent + greenPercent + yellowPercent,
  }];
  // Calculate dynamic axis domain
  const maxPercent = Math.min(Math.max(100, Math.ceil((bluePercent + greenPercent + yellowPercent) / 10) * 10), 200);
  return (
    <div style={{ width: '100%', height: 200, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 28, marginBottom: 36 }}>
      <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Weekly Progress</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 38, right: 40, left: 10, bottom: 10 }}
          barCategoryGap={16}
        >
          <CartesianGrid strokeDasharray="6 6" stroke="#bbb" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 16, whiteSpace: 'pre-line', fontWeight: 500 }} axisLine={false} tickLine={false} />
          <XAxis type="number" domain={[0, maxPercent]} tickFormatter={tick => `${tick}%`} tick={{ fontSize: 14 }} />
          <Tooltip formatter={value => value == null ? '-' : `${Number(value).toFixed(1)}%`} />
          <ReferenceLine x={100} stroke="#888" strokeDasharray="6 3" label={{ value: 'Baseline Target', position: 'top', fontSize: 15, fill: '#888' }} />
          <Bar dataKey="blueBar" stackId="a" fill="#3c5ef8ff" name="Progress to Weekly Goal">
            <LabelList dataKey="blueBar" position="top" formatter={v => v > 0 ? `${v.toFixed(1)}%` : ''} />
          </Bar>
          <Bar dataKey="greenBar" stackId="a" fill="#22bb33" name="Compensated P2 to Baseline">
            <LabelList dataKey="greenBar" position="top" formatter={v => v > 0 ? `${v.toFixed(1)}%` : ''} />
          </Bar>
          <Bar dataKey="yellowBar" stackId="a" fill="#fabf52ff" name="Overachievement">
            <LabelList dataKey="yellowBar" position="top" formatter={v => v > 0 ? `${v.toFixed(1)}%` : ''} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
