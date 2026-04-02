import express from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { createFinalTest, getFinalTest, submitFinalTest } from "../controllers/finalTestController.js";

const router = express.Router();

// Admin
router.post("/admin/courses/:courseId/final-test", requireAuth, requireAdmin, createFinalTest);

// Student
router.get("/courses/:courseId/final-test", requireAuth, getFinalTest);
router.post("/courses/:courseId/final-test/submit", requireAuth, submitFinalTest);

export default router;

