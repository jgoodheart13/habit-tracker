import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  markHabitComplete as apiMarkHabitComplete,
  fetchTags,
  addTag as apiAddTag,
} from "../api/habitsApi"

export function getTags() {
  // API call
  return fetchTags();
}

export function saveTag(tag) {
  // API call
  return apiAddTag(tag);
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
