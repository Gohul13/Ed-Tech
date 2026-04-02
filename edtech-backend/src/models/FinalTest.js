import mongoose from "mongoose";

const finalTestQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length >= 2 &&
          arr.every((s) => typeof s === "string" && s.trim().length > 0),
        message: "Each question must have at least 2 non-empty options"
      }
    },
    correctAnswer: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

finalTestQuestionSchema.path("correctAnswer").validate(function (value) {
  if (!Array.isArray(this.options)) return false;
  return Number.isInteger(value) && value >= 0 && value < this.options.length;
}, "correctAnswer must be a valid option index");

const finalTestSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
      index: true
    },
    questions: {
      type: [finalTestQuestionSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Final test must have at least 1 question"
      }
    }
  },
  { timestamps: true }
);

const FinalTest = mongoose.model("FinalTest", finalTestSchema);

export default FinalTest;
