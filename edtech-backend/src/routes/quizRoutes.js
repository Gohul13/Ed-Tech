import express from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { createLessonQuiz, getLessonQuiz, submitLessonQuiz } from "../controllers/quizController.js";

const router = express.Router();

// Admin
router.post("/admin/lessons/:lessonId/quiz", requireAuth, requireAdmin, createLessonQuiz);

// Student
router.get("/lessons/:lessonId/quiz", requireAuth, getLessonQuiz);
router.post("/lessons/:lessonId/quiz/submit", requireAuth, submitLessonQuiz);

export default router;

