// HabitBuilderPage.js
import React from 'react';
import HabitForm from '../components/HabitForm';
import { addHabit } from '../services/habitService';

export default function HabitBuilderPage({ onHabitAdded }) {
  function handleAdd(habit) {
    addHabit(habit);
    if (onHabitAdded) onHabitAdded(habit);
  }
  return (
    <div style={{ padding: 16, maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Add a New Habit</h2>
      <HabitForm onAdd={handleAdd} />
    </div>
  );
}
