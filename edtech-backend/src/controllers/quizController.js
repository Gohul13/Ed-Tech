import Quiz from "../models/Quiz.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";

const PASS_PERCENT = 60;

function sanitizeQuizForStudent(quizDoc) {
  return {
    lessonId: quizDoc.lessonId,
    total: quizDoc.questions.length,
    questions: quizDoc.questions.map((q) => ({
      question: q.question,
      options: q.options
    }))
  };
}

/**
 * POST /admin/lessons/:lessonId/quiz
 * Admin creates/replaces quiz for a lesson.
 */
export const createLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { questions } = req.body;

    const lesson = await Lesson.findOne({ _id: lessonId, createdBy: req.user._id });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found or unauthorized" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions must be a non-empty array" });
    }

    const quiz = await Quiz.findOneAndUpdate(
      { lessonId },
      { lessonId, questions },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: "Quiz saved", quizId: quiz._id, lessonId: quiz.lessonId });
  } catch (error) {
    res.status(500).json({ message: "Failed to save quiz" });
  }
};

/**
 * GET /lessons/:lessonId/quiz
 * Student fetches quiz (without correct answers).
 */
export const getLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const quiz = await Quiz.findOne({ lessonId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found for this lesson" });
    }

    res.json(sanitizeQuizForStudent(quiz));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

/**
 * POST /lessons/:lessonId/quiz/submit
 * Student submits answers and gets score.
 * Also stores latest quizScore/isQuizPassed on Enrollment.lessonProgress.
 */
export const submitLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;

    const lesson = await Lesson.findById(lessonId).select("_id courseId isPublished");
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

    const quiz = await Quiz.findOne({ lessonId });
    if (!quiz) {
      return res.status(400).json({ message: "Quiz is required for this lesson" });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array of option indices" });
    }

    const total = quiz.questions.length;
    let score = 0;
    const review = [];
    for (let i = 0; i < total; i++) {
      const selectedAnswer = Number.isInteger(answers[i]) ? answers[i] : null;
      const correctAnswer = quiz.questions[i].correctAnswer;
      const isCorrect = selectedAnswer === correctAnswer;
      if (isCorrect) {
        score += 1;
      }
      review.push({
        question: quiz.questions[i].question,
        options: quiz.questions[i].options,
        selectedAnswer,
        correctAnswer,
        isCorrect
      });
    }

    const percent = total === 0 ? 0 : Math.round((score / total) * 100);
    const passed = percent >= PASS_PERCENT;
    const requiredScore = Math.ceil((PASS_PERCENT / 100) * total);

    const idx = enrollment.lessonProgress.findIndex((lp) => String(lp.lessonId) === String(lessonId));
    const entry = {
      lessonId,
      quizScore: score,
      quizTotal: total,
      isQuizPassed: passed,
      lastQuizAttemptAt: new Date()
    };
    if (idx >= 0) {
      enrollment.lessonProgress[idx].quizScore = entry.quizScore;
      enrollment.lessonProgress[idx].quizTotal = entry.quizTotal;
      enrollment.lessonProgress[idx].isQuizPassed = entry.isQuizPassed;
      enrollment.lessonProgress[idx].lastQuizAttemptAt = entry.lastQuizAttemptAt;
    } else {
      enrollment.lessonProgress.push(entry);
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
    res.status(500).json({ message: "Failed to submit quiz" });
  }
};

