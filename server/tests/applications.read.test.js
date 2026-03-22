/**
 * GET /applications/:id - Read Single Application Tests
 *
 * Tests the endpoint for retrieving a single application by ID.
 * Only the owner can access their application; others get 404.
 */

import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import { createAndAuthenticateUser } from "./utils/testSetup.js";
import { applicationBuilder } from "./utils/testData.js";
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
    .send(applicationBuilder({ company: "TestCorp" }));

  expect(response.status).toBe(201);
  applicationId = response.body.application.id;
});

afterAll(async () => {
  await cleanupUsers(usersToCleanup);
  await disconnectPrisma();
});

describe("GET /applications/:id - Read Single Application", () => {
  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app).get(
        `/api/applications/${applicationId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization header missing");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("Validation - ID format", () => {
    it("should return 400 when id is not a positive number", async () => {
      const response = await request(app)
        .get("/api/applications/abc")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is zero", async () => {
      const response = await request(app)
        .get("/api/applications/0")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Application ID must be a valid positive number",
      );
    });

    it("should return 400 when id is negative", async () => {
      const response = await request(app)
        .get("/api/applications/-5")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Application ID must be a valid positive number",
      );
    });
  });

  describe("Successful retrieval", () => {
    it("should return the application when owner requests it", async () => {
      const response = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.application.id).toBe(applicationId);
      expect(response.body.application.company).toBe("TestCorp");
      expect(response.body.application.position).toBe("Test Engineer");
      expect(response.body.application.status).toBe("APPLIED");
      expect(response.body.application).toHaveProperty("createdAt");
      expect(response.body.application).toHaveProperty("updatedAt");
    });
  });

  describe("Not found scenarios", () => {
    it("should return 404 when application does not exist", async () => {
      const response = await request(app)
        .get("/api/applications/999999")
        .set("Authorization", `Bearer ${user.token}`);

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

      // Try to access with first user's token
      const response = await request(app)
        .get(`/api/applications/${otherAppId}`)
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Application not found");
    });
  });
});
