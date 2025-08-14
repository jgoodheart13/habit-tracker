// HabitChecklist.js
import React from 'react';

export default function HabitChecklist({ habits, onComplete }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {habits.map(habit => (
        <label key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: 10, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <input
            type="checkbox"
            checked={habit.completedDates.includes(today)}
            onChange={() => onComplete(habit.id, today)}
            style={{ accentColor: '#fc5200', width: 20, height: 20 }}
          />
          <span style={{ fontWeight: 500 }}>{habit.name}</span>
          <span style={{ fontSize: 12, color: '#888' }}>({habit.type})</span>
        </label>
      ))}
    </div>
  );
}
