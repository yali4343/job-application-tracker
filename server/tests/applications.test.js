import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

/**
 * Application Controller Integration Tests
 * Tests POST /applications endpoint with authentication and validation
 */

// Test user credentials
const testUser = {
  name: "App Test User",
  email: `apptest-${Date.now()}@test.com`,
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
 * Cleanup: Delete test user and all their applications
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

describe("Application Controller - POST /applications", () => {
  describe("Successful creation", () => {
    it("should create application successfully with valid token and valid body", async () => {
      const applicationData = {
        company: "Google",
        position: "Backend Developer",
        status: "APPLIED",
        appliedDate: "2026-03-22",
        notes: "First application",
      };

      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Application created successfully",
      );
      expect(response.body).toHaveProperty("application");
      expect(response.body.application.company).toBe("Google");
      expect(response.body.application.position).toBe("Backend Developer");
      expect(response.body.application.status).toBe("APPLIED");
      expect(response.body.application.notes).toBe("First application");
    });

    it("should create application with default status (APPLIED) when status is not provided", async () => {
      const applicationData = {
        company: "Microsoft",
        position: "Senior Engineer",
        appliedDate: "2026-03-21",
      };

      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.application.status).toBe("APPLIED");
    });

    it("should create application without notes", async () => {
      const applicationData = {
        company: "Meta",
        position: "Software Engineer",
        status: "INTERVIEW",
        appliedDate: "2026-03-20",
      };

      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.application.notes).toBeNull();
    });

    it("should verify created application has authenticated userId (not from client)", async () => {
      const applicationData = {
        company: "Apple",
        position: "iOS Developer",
        appliedDate: "2026-03-19",
      };

      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);

      // Verify in database that userId matches authenticated user
      const created = await prisma.application.findUnique({
        where: { id: response.body.application.id },
      });

      expect(created.userId).toBe(testUserId);
    });
  });

  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const applicationData = {
        company: "Google",
        position: "Backend Developer",
        appliedDate: "2026-03-22",
      };

      const response = await request(app)
        .post("/api/applications")
        .send(applicationData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Authorization header missing",
      );
    });

    it("should return 401 with invalid token", async () => {
      const applicationData = {
        company: "Google",
        position: "Backend Developer",
        appliedDate: "2026-03-22",
      };

      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", "Bearer invalid.jwt.token")
        .send(applicationData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Validation - Required fields", () => {
    it("should return 400 when company is missing", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          position: "Developer",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Company is required");
    });

    it("should return 400 when company is empty string", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "   ",
          position: "Developer",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Company is required");
    });

    it("should return 400 when position is missing", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Position is required");
    });

    it("should return 400 when position is empty string", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          position: "   ",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Position is required");
    });

    it("should return 400 when appliedDate is missing", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          position: "Developer",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Applied date is required",
      );
    });
  });

  describe("Validation - Status enum", () => {
    it("should return 400 when status is invalid", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          position: "Developer",
          status: "PENDING",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid status");
      expect(response.body.message).toContain("APPLIED");
      expect(response.body.message).toContain("INTERVIEW");
      expect(response.body.message).toContain("OFFER");
      expect(response.body.message).toContain("REJECTED");
    });

    it("should accept all valid statuses: APPLIED, INTERVIEW, OFFER, REJECTED", async () => {
      const statuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

      for (const status of statuses) {
        const response = await request(app)
          .post("/api/applications")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            company: `Company-${status}`,
            position: "Developer",
            status,
            appliedDate: "2026-03-22",
          });

        expect(response.status).toBe(201);
        expect(response.body.application.status).toBe(status);
      }
    });
  });

  describe("Validation - Date format", () => {
    it("should return 400 when appliedDate is invalid format", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          position: "Developer",
          appliedDate: "not-a-date",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid date format. Use YYYY-MM-DD",
      );
    });

    it("should accept valid ISO date format (YYYY-MM-DD)", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          position: "Developer",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(201);
    });
  });

  describe("Input trimming", () => {
    it("should trim whitespace from company and position", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "  Google  ",
          position: "  Developer  ",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(201);
      expect(response.body.application.company).toBe("Google");
      expect(response.body.application.position).toBe("Developer");
    });

    it("should trim notes if provided", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "Google",
          position: "Developer",
          appliedDate: "2026-03-22",
          notes: "  Great company with good benefits  ",
        });

      expect(response.status).toBe(201);
      expect(response.body.application.notes).toBe(
        "Great company with good benefits",
      );
    });
  });
});
