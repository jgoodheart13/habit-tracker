import api from "../services/axios"

export async function getUserProfile() {
  const { data } = await api.get("/user/profile")
  return data
}

export async function updateUserPreferences(preferences) {
  const { data } = await api.patch("/user/preferences", preferences)
  return data
}
