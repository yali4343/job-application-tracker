import api from "./api.js";

/**
 * Register a new user
 * Returns: { user: { id, name, email, createdAt }, token }
 */
export async function register(name, email, password) {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
}

/**
 * Login with email and password
 * Returns: { user: { id, name, email }, token }
 */
export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
}
