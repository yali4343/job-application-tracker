import { Router } from "express";
import {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/applications - Create a new application (requires authentication)
router.post("/", verifyToken, createApplication);

// GET /api/applications - Get all applications of authenticated user (requires authentication)
router.get("/", verifyToken, getApplications);

// GET /api/applications/:id - Get a single application by id (requires authentication)
router.get("/:id", verifyToken, getApplication);

// PUT /api/applications/:id - Update an application (requires authentication and ownership)
router.put("/:id", verifyToken, updateApplication);

// DELETE /api/applications/:id - Delete an application (requires authentication and ownership)
router.delete("/:id", verifyToken, deleteApplication);

export default router;
