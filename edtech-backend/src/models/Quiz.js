import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.every((s) => typeof s === "string" && s.trim().length > 0),
        message: "Each question must have at least 2 non-empty options"
      }
    },
    correctAnswer: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

quizQuestionSchema.path("correctAnswer").validate(function (value) {
  if (!Array.isArray(this.options)) return false;
  return Number.isInteger(value) && value >= 0 && value < this.options.length;
}, "correctAnswer must be a valid option index");

const quizSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      unique: true,
      index: true
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Quiz must have at least 1 question"
      }
    }
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
