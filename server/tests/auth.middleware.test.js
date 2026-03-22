import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

/**
 * Auth Middleware Integration Tests
 * Tests the verifyToken middleware and protected routes
 */

// Test user credentials
const testUser = {
  name: "Auth Test User",
  email: `authtest-${Date.now()}@test.com`,
  password: "testpass123",
};

let authToken;
let testUserId;

/**
 * Setup: Create a test user and obtain a valid JWT token
 */
beforeAll(async () => {
  try {
    // Register test user
    const registerRes = await request(app).post("/api/auth/register").send({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
    });

    expect(registerRes.status).toBe(201);
    testUserId = registerRes.body.user.id;

    // Login to get token
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    authToken = loginRes.body.token;
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

/**
 * Cleanup: Delete test user
 */
afterAll(async () => {
  try {
    if (testUserId) {
      await prisma.application.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
    await prisma.$disconnect();
  } catch (error) {
    console.error("Test cleanup failed:", error);
  }
});

describe("Auth Middleware - verifyToken", () => {
  describe("Protected Route Access", () => {
    it("should return 200 with valid Bearer token", async () => {
      const response = await request(app)
        .get("/api/protected-test")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Access granted");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.userId).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should return 401 without Authorization header", async () => {
      const response = await request(app).get("/api/protected-test");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Authorization header missing",
      );
    });

    it("should return 401 with malformed Authorization header (missing Bearer)", async () => {
      const response = await request(app)
        .get("/api/protected-test")
        .set("Authorization", authToken);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token format");
    });

    it("should return 401 with empty Bearer token", async () => {
      const response = await request(app)
        .get("/api/protected-test")
        .set("Authorization", "Bearer");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token format");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/protected-test")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Auth Routes", () => {
    it("should return 200 with valid login credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });

    it("should return 401 with invalid email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@test.com",
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password",
      );
    });

    it("should return 401 with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password",
      );
    });
  });
});
