import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

/**
 * GET /lesson/:lessonId
 * Get a single lesson by ID (user must be enrolled in the course)
 */
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).select("title content videoUrl attachments courseId order");
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const course = await Course.findOne({ _id: lesson.courseId, isPublished: true });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: lesson.courseId
    });
    if (!enrollment) {
      return res.status(403).json({ message: "You must enroll in this course to view lessons" });
    }

    res.json({
      ...lesson.toObject(),
      courseId: lesson.courseId,
      courseTitle: course.title
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lesson" });
  }
};

/**
 * GET /courses/:courseId/lessons
 * Get published lessons of a published course (user must be enrolled)
 */
export const getPublishedLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and is published
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll in this course"
      });
    }

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    // Fetch only published lessons
    const lessons = await Lesson.find({
      courseId,
      isPublished: true
    })
      .select("title content videoUrl attachments order")
      .sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
}; 