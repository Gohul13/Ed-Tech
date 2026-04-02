import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
/**
 * POST /enroll/:courseId
 * Student enrolls in a course
 */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Only students can enroll
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    // Check if course exists and is published
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId
    });

    res.status(201).json(enrollment);

  } catch (error) {
    res.status(500).json({ message: "Enrollment failed" });
  }
};
export const getMyCourses = async (req, res) => {
  try {

    const enrollments = await Enrollment.find({
      studentId: req.user._id
    })
    .populate("courseId", "title description thumbnail")
    .sort({ createdAt: -1 });

    const result = enrollments.map((enrollment) => ({
      enrollmentId: enrollment._id,
      courseId: enrollment.courseId._id,
      title: enrollment.courseId.title,
      description: enrollment.courseId.description,
      thumbnail: enrollment.courseId.thumbnail,
      progressPercentage: enrollment.progressPercentage,
      isCompleted: enrollment.isCompleted,
      completedLessons: enrollment.completedLessons || [],
      lessonProgress: enrollment.lessonProgress || [],
      finalTestScore: enrollment.finalTestScore ?? null,
      finalTestTotal: enrollment.finalTestTotal ?? null,
      isFinalTestPassed: enrollment.isFinalTestPassed ?? false
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: lesson.courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    if (enrollment.completedLessons.some((id) => id.toString() === lessonId))
    {
        return res.json({ message: "Lesson already completed" });
    }

    const quiz = await Quiz.findOne({ lessonId }).select("_id");
    if (!quiz) {
      return res.status(400).json({ message: "Quiz is required before completing this lesson" });
    }

    const lp = (enrollment.lessonProgress || []).find((x) => String(x.lessonId) === String(lessonId));
    if (!lp || !lp.isQuizPassed) {
      return res.status(400).json({ message: "You must pass the quiz to complete this lesson" });
    }

    enrollment.completedLessons.push(lessonId);

    const totalLessons = await Lesson.countDocuments({
      courseId: lesson.courseId,
      isPublished: true
    });

    const progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

    enrollment.progressPercentage = progress;

    await enrollment.save();

    res.json({
      message: "Lesson completed",
      progressPercentage: enrollment.progressPercentage
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to update progress" });
  }
};
