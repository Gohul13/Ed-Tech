import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

export const getAdminStats = async (req, res) => {
  try {

    const totalCourses = await Course.countDocuments();

    const totalStudents = await User.countDocuments({
      role: "student"
    });

    const totalEnrollments = await Enrollment.countDocuments();

    const completedCourses = await Enrollment.countDocuments({
      isCompleted: true
    });

    res.json({
      totalCourses,
      totalStudents,
      totalEnrollments,
      completedCourses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch analytics"
    });
  }
};
export const getCourseProgressAnalytics = async (req, res) => {
  try {

    const analytics = await Enrollment.aggregate([
      {
        $group: {
          _id: "$courseId",
          enrollments: { $sum: 1 },
          averageProgress: { $avg: "$progressPercentage" },
          completedStudents: {
            $sum: {
              $cond: [{ $eq: ["$isCompleted", true] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      {
        $unwind: "$course"
      },
      {
        $project: {
          _id: 0,
          courseTitle: "$course.title",
          enrollments: 1,
          averageProgress: { $round: ["$averageProgress", 2] },
          completedStudents: 1
        }
      }
    ]);

    res.json(analytics);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch analytics"
    });
  }
};