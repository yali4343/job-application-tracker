/**
 * PUT /applications/:id - Update Application Tests
 *
 * Tests the endpoint for updating existing applications.
 * Supports partial updates. Only the owner can update their application.
 */

import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import { createAndAuthenticateUser } from "./utils/testSetup.js";
import { applicationBuilder, invalidData } from "./utils/testData.js";
import {
  cleanupUser,
  cleanupUsers,
  disconnectPrisma,
} from "./utils/testCleanup.js";

let user;
let applicationId;
const usersToCleanup = [];

beforeAll(async () => {
  user = await createAndAuthenticateUser(app);
  usersToCleanup.push(user.userId);

  // Create test application
  const response = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${user.token}`)
    .send(
      applicationBuilder({
        company: "OriginalCorp",
        notes: "Original notes",
      }),
    );

  expect(response.status).toBe(201);
  applicationId = response.body.application.id;
});

afterAll(async () => {
  await cleanupUsers(usersToCleanup);
  await disconnectPrisma();
});

describe("PUT /applications/:id - Update Application", () => {
  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .send({ company: "Updated" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization header missing");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", "Bearer invalid.jwt.token")
        .send({ company: "Updated" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("Validation - ID format", () => {
    it("should return 400 when id is not a positive number", async () => {
      const response = await request(app)
        .put("/api/applications/abc")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: "Updated" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is zero", async () => {
      const response = await request(app)
        .put("/api/applications/0")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: "Updated" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is negative", async () => {
      const response = await request(app)
        .put("/api/applications/-5")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: "Updated" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Application ID must be a valid positive number",
      );
    });
  });

  describe("Not found scenarios", () => {
    it("should return 404 when application does not exist", async () => {
      const response = await request(app)
        .put("/api/applications/999999")
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Application not found");
    });

    it("should return 404 when application belongs to another user", async () => {
      const otherUser = await createAndAuthenticateUser(app);
      usersToCleanup.push(otherUser.userId);

      // Other user creates an application
      const appRes = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${otherUser.token}`)
        .send(applicationBuilder({ company: "SecretCorp" }));

      expect(appRes.status).toBe(201);
      const otherAppId = appRes.body.application.id;

      // Try to update with first user's token
      const response = await request(app)
        .put(`/api/applications/${otherAppId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: "HackedCorp" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Application not found");
    });
  });

  describe("Validation - Field values", () => {
    it("should return 400 when company is empty whitespace", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: invalidData.company.empty });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Company is required");
    });

    it("should return 400 when position is empty whitespace", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ position: invalidData.position.empty });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Position is required");
    });

    it("should return 400 when appliedDate is empty whitespace", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ appliedDate: invalidData.appliedDate.empty });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Applied date is required");
    });

    it("should return 400 when status is invalid", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ status: invalidData.status.invalid });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid status");
    });

    it("should return 400 when appliedDate is invalid format", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ appliedDate: invalidData.appliedDate.invalid });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid date format. Use YYYY-MM-DD");
    });
  });

  describe("Successful updates", () => {
    it("should update all fields and return 200", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({
          company: "UpdatedCorp",
          position: "Senior Engineer",
          status: "INTERVIEW",
          appliedDate: "2026-03-20",
          notes: "Updated notes",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Application updated successfully");
      expect(response.body.application.company).toBe("UpdatedCorp");
      expect(response.body.application.position).toBe("Senior Engineer");
      expect(response.body.application.status).toBe("INTERVIEW");
      expect(response.body.application.notes).toBe("Updated notes");
    });

    it("should support partial update - only company", async () => {
      // Get current state
      const getBefore = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`);

      const beforePosition = getBefore.body.application.position;

      // Update only company
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ company: "PartialUpdateCorp" });

      expect(response.status).toBe(200);
      expect(response.body.application.company).toBe("PartialUpdateCorp");
      expect(response.body.application.position).toBe(beforePosition);
    });

    it("should support partial update - only status", async () => {
      const getBefore = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`);

      const beforeCompany = getBefore.body.application.company;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ status: "OFFER" });

      expect(response.status).toBe(200);
      expect(response.body.application.status).toBe("OFFER");
      expect(response.body.application.company).toBe(beforeCompany);
    });

    it("should support partial update - only appliedDate", async () => {
      const getBefore = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`);

      const beforeCompany = getBefore.body.application.company;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ appliedDate: "2026-03-15" });

      expect(response.status).toBe(200);
      expect(response.body.application.appliedDate).toBe(
        "2026-03-15T00:00:00.000Z",
      );
      expect(response.body.application.company).toBe(beforeCompany);
    });

    it("should support partial update - only notes", async () => {
      const getBefore = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`);

      const beforeCompany = getBefore.body.application.company;

      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ notes: "New notes only" });

      expect(response.status).toBe(200);
      expect(response.body.application.notes).toBe("New notes only");
      expect(response.body.application.company).toBe(beforeCompany);
    });

    it("should allow updating notes to null", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
        .send({ notes: null });

      expect(response.status).toBe(200);
      expect(response.body.application.notes).toBeNull();
    });

    it("should accept all valid status values", async () => {
      const statuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

      for (const status of statuses) {
        const response = await request(app)
          .put(`/api/applications/${applicationId}`)
          .set("Authorization", `Bearer ${user.token}`)
          .send({ status });

        expect(response.status).toBe(200);
        expect(response.body.application.status).toBe(status);
      }
    });

    it("should trim whitespace from company and position", async () => {
      const response = await request(app)
        .put(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`)
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
