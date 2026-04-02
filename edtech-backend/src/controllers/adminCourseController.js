import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Quiz from "../models/Quiz.js";
import FinalTest from "../models/FinalTest.js";

/**
 * POST /admin/courses
 * Admin: create a new course (draft)
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const course = await Course.create({
      title,
      description,
      thumbnail,
      createdBy: req.user._id,
      isPublished: false
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course" });
  }
};

/**
 * PATCH /admin/courses/:id/publish
 * Admin: publish or unpublish course
 */
export const togglePublishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (isPublished) {
      const lessons = await Lesson.find({ courseId: id, createdBy: req.user._id }).select("_id");
      if (lessons.length === 0) {
        return res.status(400).json({ message: "Add at least one lesson before publishing course" });
      }

      const lessonIds = lessons.map((l) => l._id);
      const quizCount = await Quiz.countDocuments({ lessonId: { $in: lessonIds } });
      if (quizCount !== lessonIds.length) {
        return res.status(400).json({ message: "All lessons must have a quiz before publishing course" });
      }

      const finalTest = await FinalTest.findOne({ courseId: id }).select("_id");
      if (!finalTest) {
        return res.status(400).json({ message: "Add final test before publishing course" });
      }
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { isPublished },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update publish status" });
  }
};

/**
 * GET /admin/courses
 * Admin: get own courses
 */
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      createdBy: req.user._id
    }).sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * PUT /admin/courses/:id
 * Admin: update own course (title, description, thumbnail)
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail } = req.body;

    const course = await Course.findOne({ _id: id, createdBy: req.user._id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (thumbnail !== undefined) course.thumbnail = thumbnail.trim();
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
};

/**
 * DELETE /admin/courses/:id
 * Admin: delete own course and its lessons and enrollments
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, createdBy: req.user._id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lessonIds = await Lesson.find({ courseId: id }).distinct("_id");
    await Quiz.deleteMany({ lessonId: { $in: lessonIds } });
    await Lesson.deleteMany({ courseId: id });
    await FinalTest.deleteOne({ courseId: id });
    await Enrollment.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course" });
  }
};