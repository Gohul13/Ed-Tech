import express from "express";
import { getAdminStats } from "../controllers/adminAnalyticsController.js";
import { getCourseProgressAnalytics } from "../controllers/adminAnalyticsController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, getAdminStats);
router.get(
  "/course-progress",
  requireAuth,
  requireAdmin,
  getCourseProgressAnalytics
);

export default router;