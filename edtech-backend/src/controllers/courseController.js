import Course from "../models/Course.js";
/**
 * GET /courses
 * Public: list all published courses
 */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select("title description thumbnail")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * GET /courses/:id
 * Public: get a single published course
 */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      _id: id,
      isPublished: true
    }).select("title description thumbnail");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course" });
  }
};
