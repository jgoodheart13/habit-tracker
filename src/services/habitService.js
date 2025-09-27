import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  markHabitComplete as apiMarkHabitComplete,
} from "./habitsApi";

const TAGS_KEY = "habit_tags";

export function getTags() {
  const tags = localStorage.getItem(TAGS_KEY);
  return tags ? JSON.parse(tags) : [];
}

export function saveTag(tag) {
  const tags = getTags();
  // Only add if not already present (by label and type)
  if (!tags.some((t) => t.label === tag.label && t.type === tag.type)) {
    tags.push(tag);
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }
}

export function getHabits() {
  // API call
  return fetchHabits();
}

export function addHabit(habit) {
  // API call
  return apiAddHabit(habit);
}

export function updateHabit(id, updates) {
  // API call
  return apiUpdateHabit(id, updates);
}

export function markHabitComplete(id, date, isChecked) {
  // API call
  return apiMarkHabitComplete(id, date, isChecked);
}

export function deleteHabit(id) {
  // API call
  return apiDeleteHabit(id);
}
