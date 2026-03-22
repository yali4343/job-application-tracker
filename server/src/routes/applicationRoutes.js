import { Router } from "express";
import {
  createApplication,
  getApplications,
} from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/applications - Get all applications of authenticated user (requires authentication)
router.get("/", verifyToken, getApplications);

// POST /api/applications - Create a new application (requires authentication)
router.post("/", verifyToken, createApplication);

export default router;
