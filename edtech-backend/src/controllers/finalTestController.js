import FinalTest from "../models/FinalTest.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";

const PASS_PERCENT = 60;

function sanitizeFinalTestForStudent(doc) {
  return {
    courseId: doc.courseId,
    total: doc.questions.length,
    questions: doc.questions.map((q) => ({
      question: q.question,
      options: q.options
    }))
  };
}

/**
 * POST /admin/courses/:courseId/final-test
 */
export const createFinalTest = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { questions } = req.body;

    const course = await Course.findOne({ _id: courseId, createdBy: req.user._id });
    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions must be a non-empty array" });
    }

    const test = await FinalTest.findOneAndUpdate(
      { courseId },
      { courseId, questions },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: "Final test saved", finalTestId: test._id, courseId: test.courseId });
  } catch (error) {
    res.status(500).json({ message: "Failed to save final test" });
  }
};

/**
 * GET /courses/:courseId/final-test
 */
export const getFinalTest = async (req, res) => {
  try {
    const { courseId } = req.params;

    const test = await FinalTest.findOne({ courseId });
    if (!test) {
      return res.status(404).json({ message: "Final test not found for this course" });
    }

    res.json(sanitizeFinalTestForStudent(test));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch final test" });
  }
};

/**
 * POST /courses/:courseId/final-test/submit
 */
export const submitFinalTest = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body;

    const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    const totalLessons = await Lesson.countDocuments({ courseId, isPublished: true });
    const completedCount = (enrollment.completedLessons || []).length;
    if (totalLessons > 0 && completedCount < totalLessons) {
      return res.status(400).json({ message: "Complete all lessons before taking the final test" });
    }

    const test = await FinalTest.findOne({ courseId });
    if (!test) {
      return res.status(400).json({ message: "Final test is required for this course" });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array of option indices" });
    }

    const total = test.questions.length;
    let score = 0;
    const review = [];
    for (let i = 0; i < total; i++) {
      const selectedAnswer = Number.isInteger(answers[i]) ? answers[i] : null;
      const correctAnswer = test.questions[i].correctAnswer;
      const isCorrect = selectedAnswer === correctAnswer;
      if (isCorrect) {
        score += 1;
      }
      review.push({
        question: test.questions[i].question,
        options: test.questions[i].options,
        selectedAnswer,
        correctAnswer,
        isCorrect
      });
    }
    const percent = total === 0 ? 0 : Math.round((score / total) * 100);
    const passed = percent >= PASS_PERCENT;
    const requiredScore = Math.ceil((PASS_PERCENT / 100) * total);

    enrollment.finalTestScore = score;
    enrollment.finalTestTotal = total;
    enrollment.isFinalTestPassed = passed;
    enrollment.lastFinalTestAttemptAt = new Date();

    if (passed) {
      enrollment.isCompleted = true;
      enrollment.progressPercentage = 100;
    }

    await enrollment.save();

    res.json({
      score,
      total,
      passed,
      percent,
      passScorePercent: PASS_PERCENT,
      requiredScore,
      review
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit final test" });
  }
};

