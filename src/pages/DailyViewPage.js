// DailyViewPage.js
import React, { useState, useEffect } from 'react';
import HabitChecklist from '../components/HabitChecklist';
import HabitChart from '../components/HabitChart';
import { getHabits, markHabitComplete } from '../services/habitService';
import { calculateRollingAverage } from '../utils/rollingAverage';

function getLastNDates(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function DailyViewPage() {
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  function handleComplete(id, date) {
    markHabitComplete(id, date);
    setHabits(getHabits());
  }

  const last7Days = getLastNDates(7);
  const chartData = selectedHabitId
    ? calculateRollingAverage(
        habits.find(h => h.id === selectedHabitId)?.completedDates || [],
        last7Days
      )
    : habits.map(habit => ({
        name: habit.name,
        ...calculateRollingAverage(habit.completedDates, last7Days).slice(-1)[0],
      }));

  return (
    <div style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Habits</h2>
      <HabitChecklist habits={habits} onComplete={handleComplete} />
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Progress Chart</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {habits.map(habit => (
            <button
              key={habit.id}
              style={{ padding: 8, border: selectedHabitId === habit.id ? '2px solid #fc5200' : '1px solid #ccc', borderRadius: 4, background: selectedHabitId === habit.id ? '#fff7f2' : '#fff', fontWeight: 500 }}
              onClick={() => setSelectedHabitId(habit.id)}
            >
              {habit.name}
            </button>
          ))}
          <button onClick={() => setSelectedHabitId(null)} style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4, background: '#fff', fontWeight: 500 }}>
            All Habits
          </button>
        </div>
        <HabitChart
          data={Array.isArray(chartData) ? chartData : [chartData]}
          title={selectedHabitId ? habits.find(h => h.id === selectedHabitId)?.name : 'All Habits'}
        />
      </div>
    </div>
  );
}
