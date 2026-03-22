import request from "supertest";

/**
 * Create and authenticate a test user
 * Returns { userId, token, email }
 */
export async function createAndAuthenticateUser(app, userOverrides = {}) {
  const user = {
    name: "Test User",
    email: `testuser-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@test.com`,
    password: "testpass123",
    ...userOverrides,
  };

  // Register user
  const registerRes = await request(app).post("/api/auth/register").send({
    name: user.name,
    email: user.email,
    password: user.password,
  });

  if (registerRes.status !== 201) {
    throw new Error(
      `Failed to register test user: ${JSON.stringify(registerRes.body)}`,
    );
  }

  const userId = registerRes.body.user.id;

  // Login to get token
  const loginRes = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: user.password,
  });

  if (loginRes.status !== 200) {
    throw new Error(
      `Failed to login test user: ${JSON.stringify(loginRes.body)}`,
    );
  }

  const token = loginRes.body.token;

  return {
    userId,
    token,
    email: user.email,
  };
}
