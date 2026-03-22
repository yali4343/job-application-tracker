import { Router } from "express";
import { createApplication } from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/applications - Create a new application (requires authentication)
router.post("/", verifyToken, createApplication);

export default router;
