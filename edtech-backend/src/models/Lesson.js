import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  }
}); 

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String, 
      required: true,
      trim: true 
    },
    content: {
      type: String,
      default: ""
    },
    videoUrl: {
      type: String,
      default: ""
    },
    attachments: [{
    name: String,
    url: String
    }], 
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true 
    },
    order: {
      type: Number,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isPublished: {
      type: Boolean,   
      default: false
    }
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson; 