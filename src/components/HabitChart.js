// HabitChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HabitChart({ data, title }) {
  return (
    <div style={{ width: '100%', height: 300, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 16 }}>
      <h3 style={{ margin: '0 0 12px 0', fontWeight: 600 }}>{title}</h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={tick => `${tick}%`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={value => `${value.toFixed(1)}%`} />
          <Line type="monotone" dataKey="percent" stroke="#fc5200" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
