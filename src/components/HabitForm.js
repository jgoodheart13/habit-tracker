// HabitForm.js
import React, { useState } from 'react';

const defaultHabit = {
  name: '',
  type: 'P1',
  frequency: { daily: true, timesPerWeek: 7 },
};

export default function HabitForm({ onAdd }) {
  const [habit, setHabit] = useState(defaultHabit);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'type') {
      setHabit(h => ({ ...h, type: value }));
    } else if (name === 'name') {
      setHabit(h => ({ ...h, name: value }));
    } else if (name === 'frequency') {
      setHabit(h => ({ ...h, frequency: { ...h.frequency, daily: value === 'daily', timesPerWeek: value === 'daily' ? 7 : h.frequency.timesPerWeek } }));
    } else if (name === 'timesPerWeek') {
      setHabit(h => ({ ...h, frequency: { ...h.frequency, timesPerWeek: Number(value) } }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!habit.name) return;
    onAdd({ ...habit, id: Date.now(), completedDates: [] });
    setHabit(defaultHabit);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <input name="name" value={habit.name} onChange={handleChange} placeholder="Habit name" required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
      <select name="type" value={habit.type} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
        <option value="P1">Baseline (P1)</option>
        <option value="P2">Reach (P2)</option>
      </select>
      <select name="frequency" value={habit.frequency.daily ? 'daily' : 'weekly'} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly (n times/week)</option>
      </select>
      {!habit.frequency.daily && (
        <input type="number" name="timesPerWeek" min={1} max={7} value={habit.frequency.timesPerWeek} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
      )}
      <button type="submit" style={{ padding: 10, borderRadius: 6, background: '#fc5200', color: '#fff', border: 'none', fontWeight: 600 }}>Add Habit</button>
    </form>
  );
}
