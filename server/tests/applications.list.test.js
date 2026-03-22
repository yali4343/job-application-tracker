/**
 * GET /applications - List Applications Tests
 *
 * Tests the endpoint for retrieving all applications of the authenticated user.
 * Includes filtering by status and search.
 */

import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import { createAndAuthenticateUser } from "./utils/testSetup.js";
import { applicationDataVariations } from "./utils/testData.js";
import {
  cleanupUser,
  cleanupUsers,
  disconnectPrisma,
} from "./utils/testCleanup.js";

let user;
const usersToCleanup = [];

beforeAll(async () => {
  user = await createAndAuthenticateUser(app);
  usersToCleanup.push(user.userId);

  // Create test applications for list and filtering tests
  await prisma.application.createMany({
    data: applicationDataVariations.listSetup.map((app) => ({
      ...app,
      userId: user.userId,
    })),
  });
});

afterAll(async () => {
  await cleanupUsers(usersToCleanup);
  await disconnectPrisma();
});

describe("GET /applications - List Applications", () => {
  describe("Authentication", () => {
    it("should return 401 without Authorization header", async () => {
      const response = await request(app).get("/api/applications");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization header missing");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("Basic retrieval", () => {
    it("should return only authenticated user's applications", async () => {
      // Create another user with their own application
      const otherUser = await createAndAuthenticateUser(app);
      usersToCleanup.push(otherUser.userId);

      await prisma.application.create({
        data: {
          company: "Stripe",
          position: "Engineer",
          status: "APPLIED",
          appliedDate: new Date(),
          userId: otherUser.userId,
        },
      });

      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.applications)).toBe(true);

      // Stripe application should not be in the list
      response.body.applications.forEach((app) => {
        expect(app.company).not.toBe("Stripe");
      });

      // Should have at least the 4 test applications from beforeAll
      expect(response.body.count).toBeGreaterThanOrEqual(4);
    });

    it("should return applications sorted by createdAt descending", async () => {
      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      // Verify descending order
      for (let i = 1; i < response.body.applications.length; i++) {
        const current = new Date(response.body.applications[i].createdAt);
        const prev = new Date(response.body.applications[i - 1].createdAt);
        expect(current.getTime()).toBeLessThanOrEqual(prev.getTime());
      }
    });

    it("should return empty array when user has no applications", async () => {
      const emptyUser = await createAndAuthenticateUser(app);
      usersToCleanup.push(emptyUser.userId);

      const response = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${emptyUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe("Filtering - Status", () => {
    it("should filter by status query parameter", async () => {
      const response = await request(app)
        .get("/api/applications?status=APPLIED")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      response.body.applications.forEach((app) => {
        expect(app.status).toBe("APPLIED");
      });
    });

    it("should filter by all valid statuses", async () => {
      const statuses = ["INTERVIEW", "OFFER", "REJECTED"];

      for (const status of statuses) {
        const response = await request(app)
          .get(`/api/applications?status=${status}`)
          .set("Authorization", `Bearer ${user.token}`);

        expect(response.status).toBe(200);
        response.body.applications.forEach((app) => {
          expect(app.status).toBe(status);
        });
      }
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .get("/api/applications?status=INVALID")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid status");
    });
  });

  describe("Filtering - Search", () => {
    it("should search in company name (case-insensitive)", async () => {
      const response = await request(app)
        .get("/api/applications?search=google")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      response.body.applications.forEach((app) => {
        expect(app.company.toLowerCase()).toContain("google");
      });
    });

    it("should search in position (case-insensitive)", async () => {
      const response = await request(app)
        .get("/api/applications?search=developer")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      response.body.applications.forEach((app) => {
        const hasMatch =
          app.position.toLowerCase().includes("developer") ||
          app.company.toLowerCase().includes("developer") ||
          (app.notes && app.notes.toLowerCase().includes("developer"));

        expect(hasMatch).toBe(true);
      });
    });

    it("should search in notes (case-insensitive)", async () => {
      const response = await request(app)
        .get("/api/applications?search=aws")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications.length).toBeGreaterThan(0);

      response.body.applications.forEach((app) => {
        const hasMatch =
          (app.notes && app.notes.toLowerCase().includes("aws")) ||
          app.company.toLowerCase().includes("aws") ||
          app.position.toLowerCase().includes("aws");

        expect(hasMatch).toBe(true);
      });
    });
  });

  describe("Combining filters", () => {
    it("should combine status and search filters", async () => {
      const response = await request(app)
        .get("/api/applications?status=APPLIED&search=google")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);

      response.body.applications.forEach((app) => {
        expect(app.status).toBe("APPLIED");
        const hasMatch =
          app.company.toLowerCase().includes("google") ||
          app.position.toLowerCase().includes("google") ||
          (app.notes && app.notes.toLowerCase().includes("google"));

        expect(hasMatch).toBe(true);
      });
    });

    it("should return empty array when filters match nothing", async () => {
      const response = await request(app)
        .get("/api/applications?status=OFFER&search=nonexistent")
        .set("Authorization", `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.applications).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });
});
