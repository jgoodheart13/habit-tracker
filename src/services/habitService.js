// habitService.js
// Abstracts localStorage for habits. Swap for API later.

const HABITS_KEY = 'habits';

export function getHabits() {
  const habits = localStorage.getItem(HABITS_KEY);
  return habits ? JSON.parse(habits) : [];
}

export function saveHabits(habits) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function addHabit(habit) {
  const habits = getHabits();
  habits.push(habit);
  saveHabits(habits);
}

export function updateHabit(id, updates) {
  const habits = getHabits().map(h => h.id === id ? { ...h, ...updates } : h);
  saveHabits(habits);
}

export function markHabitComplete(id, date) {
  const habits = getHabits().map(h => h.id === id ? { ...h, completedDates: [...h.completedDates, date] } : h);
  saveHabits(habits);
}

export function deleteHabit(id) {
  const habits = getHabits().filter(h => h.id !== id);
  saveHabits(habits);
}
