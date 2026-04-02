import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import uploadVideo from "../middleware/videoUploadMiddleware.js";
import { uploadLessonFile } from "../controllers/adminLessonController.js";
import { deleteLessonAttachment }  from "../controllers/adminLessonController.js";
import { uploadLessonVideo } from "../controllers/adminLessonController.js";

import {
  createLesson, 
  getLessonsByCourse,
  updateLesson,
  deleteLesson,
  togglePublishLesson
} from "../controllers/adminLessonController.js";

import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router(); 

router.post(
  "/courses/:courseId/lessons",
  requireAuth,
  requireAdmin,
  createLesson
);

router.get(
  "/courses/:courseId/lessons",
  requireAuth,
  requireAdmin,
  getLessonsByCourse
);

router.put(
  "/lessons/:lessonId",
  requireAuth,
  requireAdmin,
  updateLesson
);

router.delete(
  "/lessons/:lessonId",
  requireAuth,
  requireAdmin,
  deleteLesson
);

router.patch(
  "/lessons/:lessonId/publish",
  requireAuth,
  requireAdmin,
  togglePublishLesson
);

router.post(
  "/lessons/:lessonId/upload",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  uploadLessonFile
);

router.post(
  "/lessons/:lessonId/upload-video",
  requireAuth,
  requireAdmin,
  uploadVideo.single("video"),
  uploadLessonVideo
);
router.delete(
  "/lessons/:lessonId/attachments/:index",
  requireAuth,
  requireAdmin,
  deleteLessonAttachment 
);
export default router;
