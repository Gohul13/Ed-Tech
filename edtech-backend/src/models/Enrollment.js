import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    enrolledAt: {
      type: Date,
      default: Date.now
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ],

    lessonProgress: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
          required: true
        },
        quizScore: { type: Number, default: null },
        quizTotal: { type: Number, default: null },
        isQuizPassed: { type: Boolean, default: false },
        lastQuizAttemptAt: { type: Date, default: null }
      }
    ],

    progressPercentage: {
      type: Number,
      default: 0
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    finalTestScore: { type: Number, default: null },
    finalTestTotal: { type: Number, default: null },
    isFinalTestPassed: { type: Boolean, default: false },
    lastFinalTestAttemptAt: { type: Date, default: null },

    lastAccessedAt: {
      type: Date,
      default : Date.now
    }
  },
  { timestamps: true }
);

// 🔐 Prevent duplicate enrollment
enrollmentSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment; 