import express from "express";
import { getPublishedLessons, getLessonById } from "../controllers/lessonController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/:courseId/lessons", requireAuth, getPublishedLessons);
router.get("/lesson/:lessonId", requireAuth, getLessonById);

export default router;