import express from "express";
import { enrollInCourse } from "../controllers/enrollmentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getMyCourses } from "../controllers/enrollmentController.js";
import { completeLesson } from "../controllers/enrollmentController.js";

const router = express.Router();

router.post("/enroll/:courseId", requireAuth, enrollInCourse);
router.get("/my-courses", requireAuth, getMyCourses);
router.post("/lessons/:lessonId/complete", requireAuth, completeLesson);

export default router;