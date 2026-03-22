/**
 * DELETE /applications/:id - Delete Application Tests
 *
 * Tests the endpoint for deleting job applications.
 * Only the application owner can delete their own applications.
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

let user1;
let user2;

beforeAll(async () => {
  user1 = await createAndAuthenticateUser(app);
  user2 = await createAndAuthenticateUser(app);
});

afterAll(async () => {
  await cleanupUsers([user1.userId, user2.userId]);
  await disconnectPrisma();
});

describe("DELETE /applications/:id - Delete Application", () => {
  describe("Successful deletion", () => {
    it("should delete an owned application successfully", async () => {
      // First, create an application
      const createResponse = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user1.token}`)
        .send(applicationBuilder({ company: "DeleteTest Corp" }));

      const appId = createResponse.body.application.id;
      expect(createResponse.status).toBe(201);

      // Then delete it
      const deleteResponse = await request(app)
        .delete(`/api/applications/${appId}`)
        .set("Authorization", `Bearer ${user1.token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty(
        "message",
        "Application deleted successfully",
      );

      // Verify it's truly deleted
      const getResponse = await request(app)
        .get(`/api/applications/${appId}`)
        .set("Authorization", `Bearer ${user1.token}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe("Authentication validation", () => {
    it("should reject delete when no token is provided", async () => {
      // Create an application first
      const createResponse = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user1.token}`)
        .send(applicationBuilder({ company: "NoTokenTest" }));

      const appId = createResponse.body.application.id;

      // Try to delete without token
      const deleteResponse = await request(app).delete(
        `/api/applications/${appId}`,
      );

      expect(deleteResponse.status).toBe(401);
      expect(deleteResponse.body).toHaveProperty("message");

      // Clean up: delete the app ourselves since we can't use the endpoint
      await prisma.application.delete({
        where: { id: appId },
      });
    });

    it("should reject delete when token is invalid", async () => {
      // Create an application
      const createResponse = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user1.token}`)
        .send(applicationBuilder({ company: "InvalidTokenTest" }));

      const appId = createResponse.body.application.id;

      // Try to delete with invalid token
      const deleteResponse = await request(app)
        .delete(`/api/applications/${appId}`)
        .set("Authorization", "Bearer invalid.token.here");

      expect(deleteResponse.status).toBe(401);

      // Clean up
      await prisma.application.delete({
        where: { id: appId },
      });
    });
  });

  describe("ID validation", () => {
    it("should return 400 for invalid id format (non-numeric)", async () => {
      const deleteResponse = await request(app)
        .delete("/api/applications/abc")
        .set("Authorization", `Bearer ${user1.token}`);

      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.body).toHaveProperty("message");
      expect(deleteResponse.body.message).toMatch(/valid positive number/i);
    });

    it("should return 400 for negative id", async () => {
      const deleteResponse = await request(app)
        .delete("/api/applications/-1")
        .set("Authorization", `Bearer ${user1.token}`);

      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.body).toHaveProperty("message");
      expect(deleteResponse.body.message).toMatch(/valid positive number/i);
    });

    it("should return 400 for zero id", async () => {
      const deleteResponse = await request(app)
        .delete("/api/applications/0")
        .set("Authorization", `Bearer ${user1.token}`);

      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.body).toHaveProperty("message");
      expect(deleteResponse.body.message).toMatch(/valid positive number/i);
    });
  });

  describe("Application not found", () => {
    it("should return 404 when application id does not exist", async () => {
      const deleteResponse = await request(app)
        .delete("/api/applications/999999")
        .set("Authorization", `Bearer ${user1.token}`);

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toHaveProperty(
        "message",
        "Application not found",
      );
    });
  });

  describe("Ownership validation", () => {
    it("should not allow deleting another user's application", async () => {
      // User1 creates an application
      const createResponse = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${user1.token}`)
        .send(applicationBuilder({ company: "OwnershipTest" }));

      const appId = createResponse.body.application.id;
      expect(createResponse.status).toBe(201);

      // User2 tries to delete User1's application
      const deleteResponse = await request(app)
        .delete(`/api/applications/${appId}`)
        .set("Authorization", `Bearer ${user2.token}`);

      // Should return 404 (do not expose that the app exists)
      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body).toHaveProperty(
        "message",
        "Application not found",
      );

      // Verify User1's application still exists
      const getResponse = await request(app)
        .get(`/api/applications/${appId}`)
        .set("Authorization", `Bearer ${user1.token}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.application.id).toBe(appId);

      // Clean up
      await prisma.application.delete({
        where: { id: appId },
      });
    });
  });
});
