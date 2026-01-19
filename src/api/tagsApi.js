import api from "../services/axios";

export async function fetchTags() {
  const response = await api.get(`/tags`);
  return response.data;
}

export async function addTag(tag) {
  const response = await api.post(`/tags`, tag);
  return response.data;
}

export async function updateTag(id, updates) {
  const response = await api.put(`/tags/${id}`, updates);
  return response.data;
}

export async function deleteTag(id) {
  const response = await api.delete(`/tags/${id}`);
  return response.data;
}

export async function getTagHabits(tagId) {
  const response = await api.get(`/tags/${tagId}/habits`);
  return response.data;
}
