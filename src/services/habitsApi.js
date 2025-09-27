
import api from "./axios";

export async function fetchHabits() {
  const response = await api.get(`/habits`);
  return response.data;
}

export async function addHabit(habit) {
  const response = await api.post(`/habits`, habit);
  return response.data;
  
}
export async function updateHabit(id, updates) {
  const response = await api.put(`/habits/${id}`, updates);
  return response.data;
}

export async function deleteHabit(id) {
  const response = await api.delete(`/habits/${id}`);
  return response.data;
}

export async function markHabitComplete(id, date, isChecked) {
  const response = await api.post(`/habits/${id}/complete`, { date, isChecked });
  return response.data;
}
