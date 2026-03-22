/**
 * POST /applications - Create Application Tests
 *
 * Tests the endpoint for creating new job applications.
 * Each test user owns their applications; userId is taken from JWT, not request body.
 */

import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import { createAndAuthenticateUser } from "./utils/testSetup.js";
import { applicationBuilder, invalidData } from "./utils/testData.js";
import { cleanupUser, disconnectPrisma } from "./utils/testCleanup.js";

let user;

beforeAll(async () => {
  user = await createAndAuthenticateUser(app);
});

afterAll(async () => {
  await cleanupUser(user.userId);
  await disconnectPrisma();
});

describe("POST /applications - Create Application", () => {
  describe("Successful creation", () => {
    it("should create application with valid token and valid body", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(applicationBuilder({ company: "Google" }));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Application created successfully",
      );
      expect(response.body.application.company).toBe("Google");
      expect(response.body.application.position).toBe("Test Engineer");
      expect(response.body.application.status).toBe("APPLIED");
    });

    it("should create application with default status APPLIED", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          company: "Microsoft",
          position: "Senior Engineer",
          appliedDate: "2026-03-21",
        });

      expect(response.status).toBe(201);
      expect(response.body.application.status).toBe("APPLIED");
    });

    it("should create application without notes (null)", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          company: "Meta",
          position: "Software Engineer",
          status: "INTERVIEW",
          appliedDate: "2026-03-20",
        });

      expect(response.status).toBe(201);
      expect(response.body.application.notes).toBeNull();
    });

    it("should verify created application belongs to authenticated user", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(applicationBuilder({ company: "Apple" }));

      expect(response.status).toBe(201);

      // Verify in database that userId matches authenticated user
      const created = await prisma.application.findUnique({
        where: { id: response.body.application.id },
      });

      expect(created.userId).toBe(user.userId);
    });
  });

  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app)
        .post("/api/applications")
        .send(applicationBuilder());

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization header missing");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", "Bearer invalid.jwt.token")
        .send(applicationBuilder());

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("Validation - Required fields", () => {
    it("should return 400 when company is missing", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          position: "Developer",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Company is required");
    });

    it("should return 400 when company is empty whitespace", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(applicationBuilder({ company: invalidData.company.empty }));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Company is required");
    });

    it("should return 400 when position is missing", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          company: "Google",
          appliedDate: "2026-03-22",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Position is required");
    });

    it("should return 400 when position is empty whitespace", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(applicationBuilder({ position: invalidData.position.empty }));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Position is required");
    });

    it("should return 400 when appliedDate is missing", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          company: "Google",
          position: "Developer",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Applied date is required");
    });
  });

  describe("Validation - Status enum", () => {
    it("should return 400 when status is invalid", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(applicationBuilder({ status: invalidData.status.invalid }));

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid status");
      expect(response.body.message).toContain("APPLIED");
      expect(response.body.message).toContain("INTERVIEW");
      expect(response.body.message).toContain("OFFER");
      expect(response.body.message).toContain("REJECTED");
    });

    it("should accept all valid statuses", async () => {
      const statuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

      for (const status of statuses) {
        const response = await request(app)
          .post("/api/applications")
          .set("Authorization", `Bearer ${user.token}`)
          .send(applicationBuilder({ status, company: `Company-${status}` }));

        expect(response.status).toBe(201);
        expect(response.body.application.status).toBe(status);
      }
    });
  });

  describe("Validation - Date format", () => {
    it("should return 400 for invalid date format", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(
          applicationBuilder({ appliedDate: invalidData.appliedDate.invalid }),
        );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid date format. Use YYYY-MM-DD");
    });

    it("should accept valid ISO date format YYYY-MM-DD", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
        .send(applicationBuilder({ appliedDate: "2026-03-22" }));

      expect(response.status).toBe(201);
    });
  });

  describe("Input trimming", () => {
    it("should trim whitespace from company and position", async () => {
      const response = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user.token}`)
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
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          company: "Google",
          position: "Developer",
          appliedDate: "2026-03-22",
          notes: "  Great company  ",
        });

      expect(response.status).toBe(201);
      expect(response.body.application.notes).toBe("Great company");
    });
  });
});
