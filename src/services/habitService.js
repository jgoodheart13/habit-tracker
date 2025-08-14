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

export function markHabitComplete(id, date, isChecked) {
  console.log("markHabitComplete called:", { id, date, isChecked });
  const habits = getHabits().map((h) => {
    if (h.id !== id) return h;
    if (isChecked) {
      // Add date if not present
      if (!h.completedDates.includes(date)) {
        const updated = { ...h, completedDates: [...h.completedDates, date] };
        console.log("Adding date:", updated);
        return updated;
      }
      return h;
    } else {
      // Remove date if present
      const updated = {
        ...h,
        completedDates: h.completedDates.filter((d) => d !== date),
      };
      console.log("Removing date:", updated);
      return updated;
    }
  });
  saveHabits(habits);
  console.log("Habits after update:", habits);
}

export function deleteHabit(id) {
  const habits = getHabits().filter(h => h.id !== id);
  saveHabits(habits);
}
