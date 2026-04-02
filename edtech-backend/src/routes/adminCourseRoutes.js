import express from "express";
import {
  createCourse,
  togglePublishCourse,
  getMyCourses,
  updateCourse,
  deleteCourse
} from "../controllers/adminCourseController.js";

import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/courses", requireAuth, requireAdmin, createCourse);
router.get("/courses", requireAuth, requireAdmin, getMyCourses);
router.put("/courses/:id", requireAuth, requireAdmin, updateCourse);
router.patch(
  "/courses/:id/publish",
  requireAuth,
  requireAdmin,
  togglePublishCourse
);
router.delete("/courses/:id", requireAuth, requireAdmin, deleteCourse);

export default router;