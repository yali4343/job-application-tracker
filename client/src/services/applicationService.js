import api from "./api.js";

/**
 * Fetch all applications for the authenticated user
 * Supports filtering by status and searching
 */
export async function getApplications(params = {}) {
  const response = await api.get("/applications", { params });
  return response.data;
}

/**
 * Fetch a single application by id
 */
export async function getApplication(id) {
  const response = await api.get(`/applications/${id}`);
  return response.data;
}

/**
 * Create a new application
 */
export async function createApplication(data) {
  const response = await api.post("/applications", data);
  return response.data;
}

/**
 * Update an existing application
 */
export async function updateApplication(id, data) {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
}

/**
 * Delete an application
 */
export async function deleteApplication(id) {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
}
