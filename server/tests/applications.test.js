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

describe("Application Controller - GET /applications", () => {
  // Create test applications for filtering tests
  beforeAll(async () => {
    // Create diverse test applications
    await prisma.application.createMany({
      data: [
        {
          company: "Google",
          position: "Backend Developer",
          status: "APPLIED",
          appliedDate: new Date("2026-03-01"),
          notes: "Large tech company",
          userId: testUserId,
        },
        {
          company: "Microsoft",
          position: "Frontend Engineer",
          status: "INTERVIEW",
          appliedDate: new Date("2026-03-05"),
          notes: "Cloud-focused company",
          userId: testUserId,
        },
        {
          company: "Google Cloud",
          position: "DevOps Engineer",
          status: "OFFER",
          appliedDate: new Date("2026-03-10"),
          notes: "Infrastructure role",
          userId: testUserId,
        },
        {
          company: "Amazon",
          position: "Full-stack Developer",
          status: "REJECTED",
          appliedDate: new Date("2026-02-15"),
          notes: "AWS platform experience required",
          userId: testUserId,
        },
      ],
    });
  });

  describe("Authentication", () => {
    it("should reject when no token is provided", async () => {
      const response = await request(app).get("/api/applications");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Authorization header missing",
      );
    });

    it("should reject with invalid token", async () => {
      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Basic retrieval", () => {
    it("should return only the logged-in user's applications", async () => {
      // Create a second test user with their own application
      const otherUser = {
        name: "Other User",
        email: `otheruser-${Date.now()}@test.com`,
        password: "password123",
      };

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(otherUser);

      const otherUserId = registerRes.body.user.id;

      // Create an application for the other user
      await prisma.application.create({
        data: {
          company: "Stripe",
          position: "Engineer",
          status: "APPLIED",
          appliedDate: new Date(),
          userId: otherUserId,
        },
      });

      // Get applications for the first test user
      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toBeDefined();
      expect(Array.isArray(response.body.applications)).toBe(true);

      // Verify all applications belong to the authenticated user
      response.body.applications.forEach((app) => {
        // Verify by company name - the "Stripe" application should not be here
        expect(app.company).not.toBe("Stripe");
      });

      // Verify we have at least the 4 test applications created in beforeAll
      expect(response.body.count).toBeGreaterThanOrEqual(4);

      // Cleanup: remove other user
      await prisma.application.deleteMany({
        where: { userId: otherUserId },
      });
      await prisma.user.delete({
        where: { id: otherUserId },
      });
    });

    it("should return applications sorted by createdAt descending", async () => {
      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      // Check that applications are sorted by createdAt desc
      for (let i = 1; i < response.body.applications.length; i++) {
        const currentDate = new Date(response.body.applications[i].createdAt);
        const prevDate = new Date(response.body.applications[i - 1].createdAt);

        expect(currentDate.getTime()).toBeLessThanOrEqual(prevDate.getTime());
      }
    });

    it("should return empty array when user has no applications", async () => {
      // Create a third user with no applications
      const emptyUser = {
        name: "Empty User",
        email: `emptyuser-${Date.now()}@test.com`,
        password: "password123",
      };

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(emptyUser);

      expect(registerRes.status).toBe(201);

      const loginRes = await request(app).post("/api/auth/login").send({
        email: emptyUser.email,
        password: emptyUser.password,
      });

      const emptyToken = loginRes.body.token;

      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${emptyToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toEqual([]);
      expect(response.body.count).toBe(0);

      // Cleanup
      await prisma.user.delete({
        where: { id: registerRes.body.user.id },
      });
    });
  });

  describe("Filtering - Status", () => {
    it("should filter by status query parameter", async () => {
      const response = await request(app)
        .get("/api/applications?status=APPLIED")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toBeDefined();

      // Verify all applications have APPLIED status
      response.body.applications.forEach((app) => {
        expect(app.status).toBe("APPLIED");
      });

      // Should have at least 1 application with APPLIED status (from beforeAll setup)
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it("should filter by other statuses", async () => {
      const testStatuses = ["INTERVIEW", "OFFER", "REJECTED"];

      for (const testStatus of testStatuses) {
        const response = await request(app)
          .get(`/api/applications?status=${testStatus}`)
          .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        response.body.applications.forEach((app) => {
          expect(app.status).toBe(testStatus);
        });
      }
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .get("/api/applications?status=INVALID")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Invalid status");
      expect(response.body.message).toContain("APPLIED");
      expect(response.body.message).toContain("INTERVIEW");
      expect(response.body.message).toContain("OFFER");
      expect(response.body.message).toContain("REJECTED");
    });
  });

  describe("Filtering - Search", () => {
    it("should filter by search in company name (case-insensitive)", async () => {
      const response = await request(app)
        .get("/api/applications?search=google")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      // Should match both "Google" and "Google Cloud"
      response.body.applications.forEach((app) => {
        expect(app.company.toLowerCase().includes("google")).toBe(true);
      });
    });

    it("should filter by search in position (case-insensitive)", async () => {
      const response = await request(app)
        .get("/api/applications?search=developer")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      // Should match positions containing "Developer"
      response.body.applications.forEach((app) => {
        const matchesPosition =
          app.position.toLowerCase().includes("developer") ||
          app.company.toLowerCase().includes("developer") ||
          (app.notes && app.notes.toLowerCase().includes("developer"));

        expect(matchesPosition).toBe(true);
      });
    });

    it("should filter by search in notes (case-insensitive)", async () => {
      const response = await request(app)
        .get("/api/applications?search=aws")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      // Should match applications with "AWS" in notes
      response.body.applications.forEach((app) => {
        const matchesNotes =
          (app.notes && app.notes.toLowerCase().includes("aws")) ||
          app.company.toLowerCase().includes("aws") ||
          app.position.toLowerCase().includes("aws");

        expect(matchesNotes).toBe(true);
      });
    });
  });

  describe("Combining filters", () => {
    it("should combine status and search filters correctly", async () => {
      // Search for "google" with APPLIED status
      const response = await request(app)
        .get("/api/applications?status=APPLIED&search=google")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toBeDefined();

      // All results should have APPLIED status
      response.body.applications.forEach((app) => {
        expect(app.status).toBe("APPLIED");
        // And should match search in company, position, or notes
        const matchesSearch =
          app.company.toLowerCase().includes("google") ||
          app.position.toLowerCase().includes("google") ||
          (app.notes && app.notes.toLowerCase().includes("google"));

        expect(matchesSearch).toBe(true);
      });
    });

    it("should return empty array if filters match nothing", async () => {
      // Search for "nonexistent" with OFFER status
      const response = await request(app)
        .get("/api/applications?status=OFFER&search=nonexistent")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });
});

describe("Application Controller - GET /applications/:id", () => {
  let applicationId;

  /**
   * Setup: Create a test application to use in tests
   */
  beforeAll(async () => {
    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        company: "TestCorp",
        position: "Test Engineer",
        status: "APPLIED",
        appliedDate: "2026-03-22",
        notes: "Test application for GET/:id tests",
      });

    expect(response.status).toBe(201);
    applicationId = response.body.application.id;
  });

  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app).get(
        `/api/applications/${applicationId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Authorization header missing",
      );
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Validation", () => {
    it("should return 400 when id is not a valid positive number", async () => {
      const response = await request(app)
        .get("/api/applications/abc")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is zero", async () => {
      const response = await request(app)
        .get("/api/applications/0")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is negative", async () => {
      const response = await request(app)
        .get("/api/applications/-5")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Application ID must be a valid positive number",
      );
    });
  });

  describe("Successful retrieval", () => {
    it("should return 200 and the correct application when it exists and belongs to the user", async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("application");
      expect(response.body.application.id).toBe(applicationId);
      expect(response.body.application.company).toBe("TestCorp");
      expect(response.body.application.position).toBe("Test Engineer");
      expect(response.body.application.status).toBe("APPLIED");
      expect(response.body.application.notes).toBe(
        "Test application for GET/:id tests",
      );
      expect(response.body.application).toHaveProperty("createdAt");
      expect(response.body.application).toHaveProperty("updatedAt");
    });
  });

  describe("Not found scenarios", () => {
    it("should return 404 when application does not exist for this user", async () => {
      const response = await request(app)
        .get("/api/applications/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Application not found");
    });

    it("should return 404 when application exists but belongs to another user", async () => {
      // Create another user
      const otherUser = {
        name: "Other User",
        email: `otheruser-${Date.now()}@test.com`,
        password: "password123",
      };

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(otherUser);

      expect(registerRes.status).toBe(201);
      const otherUserId = registerRes.body.user.id;

      const loginRes = await request(app).post("/api/auth/login").send({
        email: otherUser.email,
        password: otherUser.password,
      });

      const otherToken = loginRes.body.token;

      // Create an application for the other user
      const appRes = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${otherToken}`)
        .send({
          company: "SecretCorp",
          position: "Secret Role",
          appliedDate: "2026-03-22",
        });

      expect(appRes.status).toBe(201);
      const otherAppId = appRes.body.application.id;

      // Try to get the other user's application with our token
      const response = await request(app)
        .get(`/api/applications/${otherAppId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Application not found");

      // Cleanup
      await prisma.application.deleteMany({
        where: { userId: otherUserId },
      });
      await prisma.user.delete({
        where: { id: otherUserId },
      });
    });
  });
});

describe("Application Controller - PUT /applications/:id", () => {
  let applicationId;
  let originalApplication;

  /**
   * Setup: Create a test application to use in update tests
   */
  beforeAll(async () => {
    const response = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        company: "OriginalCorp",
        position: "Original Engineer",
        status: "APPLIED",
        appliedDate: "2026-03-22",
        notes: "Original notes",
      });

    expect(response.status).toBe(201);
    applicationId = response.body.application.id;
    originalApplication = response.body.application;
  });

  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .send({
          company: "UpdatedCorp",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Authorization header missing",
      );
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", "Bearer invalid.jwt.token")
        .send({
          company: "UpdatedCorp",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("Validation - ID format", () => {
    it("should return 400 when id is not a valid positive number", async () => {
      const response = await request(app)
        .put("/api/applications/abc")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "UpdatedCorp",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is zero", async () => {
      const response = await request(app)
        .put("/api/applications/0")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "UpdatedCorp",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is negative", async () => {
      const response = await request(app)
        .put("/api/applications/-5")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "UpdatedCorp",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Application ID must be a valid positive number",
      );
    });
  });

  describe("Not found scenarios", () => {
    it("should return 404 when application does not exist", async () => {
      const response = await request(app)
        .put("/api/applications/999999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "UpdatedCorp",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Application not found");
    });

    it("should return 404 when application exists but belongs to another user", async () => {
      // Create another user
      const otherUser = {
        name: "Other Update User",
        email: `otherupdate-${Date.now()}@test.com`,
        password: "password123",
      };

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(otherUser);

      expect(registerRes.status).toBe(201);
      const otherUserId = registerRes.body.user.id;

      const loginRes = await request(app).post("/api/auth/login").send({
        email: otherUser.email,
        password: otherUser.password,
      });

      const otherToken = loginRes.body.token;

      // Create an application for the other user
      const appRes = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${otherToken}`)
        .send({
          company: "SecretCorp",
          position: "Secret Role",
          appliedDate: "2026-03-22",
        });

      expect(appRes.status).toBe(201);
      const otherAppId = appRes.body.application.id;

      // Try to update the other user's application with our token
      const response = await request(app)
        .put(`/api/applications/${otherAppId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "HackedCorp",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Application not found");

      // Cleanup
      await prisma.application.deleteMany({
        where: { userId: otherUserId },
      });
      await prisma.user.delete({
        where: { id: otherUserId },
      });
    });
  });

  describe("Validation - Field values", () => {
    it("should return 400 when company is empty string", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "   ",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Company is required");
    });

    it("should return 400 when position is empty string", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          position: "   ",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Position is required");
    });

    it("should return 400 when appliedDate is empty string", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          appliedDate: "   ",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Applied date is required",
      );
    });

    it("should return 400 when status is invalid", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "INVALID_STATUS",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid status");
      expect(response.body.message).toContain("APPLIED");
      expect(response.body.message).toContain("INTERVIEW");
      expect(response.body.message).toContain("OFFER");
      expect(response.body.message).toContain("REJECTED");
    });

    it("should return 400 when appliedDate is invalid format", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          appliedDate: "not-a-date",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid date format. Use YYYY-MM-DD",
      );
    });
  });

  describe("Successful updates", () => {
    it("should update all fields and return 200 with updated application", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "UpdatedCorp",
          position: "Senior Engineer",
          status: "INTERVIEW",
          appliedDate: "2026-03-20",
          notes: "Updated notes",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Application updated successfully",
      );
      expect(response.body).toHaveProperty("application");
      expect(response.body.application.id).toBe(applicationId);
      expect(response.body.application.company).toBe("UpdatedCorp");
      expect(response.body.application.position).toBe("Senior Engineer");
      expect(response.body.application.status).toBe("INTERVIEW");
      expect(response.body.application.notes).toBe("Updated notes");
      expect(response.body.application).toHaveProperty("updatedAt");
    });

    it("should support partial update - only company", async () => {
      const getRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      const beforePosition = getRes.body.application.position;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "PartialUpdateCorp",
        });

      expect(response.status).toBe(200);
      expect(response.body.application.company).toBe("PartialUpdateCorp");
      // Other fields should remain unchanged
      expect(response.body.application.position).toBe(beforePosition);
    });

    it("should support partial update - only status", async () => {
      const getRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      const beforeCompany = getRes.body.application.company;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "OFFER",
        });

      expect(response.status).toBe(200);
      expect(response.body.application.status).toBe("OFFER");
      // Other fields should remain unchanged
      expect(response.body.application.company).toBe(beforeCompany);
    });

    it("should support partial update - only appliedDate", async () => {
      const getRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      const beforeCompany = getRes.body.application.company;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          appliedDate: "2026-03-15",
        });

      expect(response.status).toBe(200);
      // Date should be updated
      expect(response.body.application.appliedDate).toBe(
        "2026-03-15T00:00:00.000Z",
      );
      // Other fields should remain unchanged
      expect(response.body.application.company).toBe(beforeCompany);
    });

    it("should support partial update - only notes", async () => {
      const getRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      const beforeCompany = getRes.body.application.company;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          notes: "New notes only",
        });

      expect(response.status).toBe(200);
      expect(response.body.application.notes).toBe("New notes only");
      // Other fields should remain unchanged
      expect(response.body.application.company).toBe(beforeCompany);
    });

    it("should allow updating notes to null", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          notes: null,
        });

      expect(response.status).toBe(200);
      expect(response.body.application.notes).toBeNull();
    });

    it("should accept all valid status values", async () => {
      const statuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

      for (const status of statuses) {
        const response = await request(app)
          .put(`/api/applications/${applicationId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            status,
          });

        expect(response.status).toBe(200);
        expect(response.body.application.status).toBe(status);
      }
    });

    it("should trim whitespace from company and position", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          company: "  Trimmed Company  ",
          position: "  Trimmed Position  ",
        });

      expect(response.status).toBe(200);
      expect(response.body.application.company).toBe("Trimmed Company");
      expect(response.body.application.position).toBe("Trimmed Position");
    });
  });
});
