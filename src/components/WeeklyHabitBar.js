// WeeklyHabitBar.js
import React from 'react';

// Helper to get all days in current week (Monday-Sunday)
function getWeekDays() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function WeeklyHabitBar({ habit }) {
  const weekDays = getWeekDays();
  const completed = weekDays.filter(d => habit.completedDates.includes(d));
  const n = habit.frequency.timesPerWeek;
  // Sort completed dates by day order
  const completedSorted = weekDays.map(d => habit.completedDates.includes(d));
  // Color logic: first N completions are blue, extras are yellow
  let blueCount = Math.min(completed.length, n);
  let yellowCount = Math.max(0, completed.length - n);
  let colored = [];
  let filled = 0;
  for (let i = 0; i < weekDays.length; i++) {
    if (completedSorted[i]) {
      if (filled < n) {
        colored.push('blue');
        filled++;
      } else {
        colored.push('yellow');
      }
    } else {
      colored.push('gray');
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ minWidth: 120, fontWeight: 500 }}>{habit.name}</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {colored.map((color, idx) => (
          <div
            key={idx}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background:
                color === 'blue' ? '#3c5ef8' :
                color === 'yellow' ? '#fabf52' : '#eee',
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#333',
            }}
            title={weekDays[idx]}
          >
            {['M','T','W','T','F','S','S'][idx]}
          </div>
        ))}
      </div>
      <span style={{ marginLeft: 12, fontSize: 13, color: '#888' }}>
        {completed.length} / {n} goal
      </span>
    </div>
  );
}
