import { Router } from "express";
import authRoutes from "./authRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/applications", applicationRoutes);

// Protected health check (for testing auth middleware)
router.get("/health", verifyToken, (req, res) => {
  res.json({ status: "OK", user: req.user });
});

// Protected test route (for auth middleware validation)
router.get("/protected-test", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});

export default router;
