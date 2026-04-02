import Lesson from "../models/Lesson.js";
import Course from "../models/Course.js"; 
import Quiz from "../models/Quiz.js";
import fs from "fs";
import path from "path";

/**
 * POST /admin/courses/:courseId/lessons
 */
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params; 
    const { title, content, videoUrl, order } = req.body;

    if (!title || !order) {
      return res.status(400).json({ message: "Title and order are required" });
    }

    // Check course ownership
    const course = await Course.findOne({
      _id: courseId,
      createdBy: req.user._id 
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found or unauthorized" });
    }

    // Check duplicate order
    const existingLesson = await Lesson.findOne({ courseId, order });

    if (existingLesson) {
      return res.status(400).json({ message: "Lesson order already exists in this course" });
    }

    const lesson = await Lesson.create({
      title,
      content,
      videoUrl,
      courseId,
      order,
      createdBy: req.user._id
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Failed to create lesson" });
  }
};
/**
 * GET /admin/courses/:courseId/lessons
 */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.find({
      courseId,
      createdBy: req.user._id
    }).sort({ order: 1 });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};
/**
 * PUT /admin/lessons/:lessonId
 */
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, videoUrl, order } = req.body;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      createdBy: req.user._id
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (order && order !== lesson.order) {
      const duplicate = await Lesson.findOne({
        courseId: lesson.courseId,
        order
      });

      if (duplicate) {
        return res.status(400).json({ message: "Order already used in this course" });
      }
    }

    lesson.title = title ?? lesson.title;
    lesson.content = content ?? lesson.content;
    lesson.videoUrl = videoUrl ?? lesson.videoUrl;
    lesson.order = order ?? lesson.order;

    await lesson.save();

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lesson" });
  }
};
/**
 * DELETE /admin/lessons/:lessonId
 */
export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      createdBy: req.user._id
    });

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    // 🔹 Delete attachment files from uploads folder
    if (lesson.attachments && lesson.attachments.length > 0) {
      for (const file of lesson.attachments) {

        const filePath = path.join(process.cwd(), file.url);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

      }
    }

    // 🔹 Delete lesson from database
    await Quiz.deleteOne({ lessonId });
    await Lesson.findByIdAndDelete(lessonId);

    res.json({
      message: "Lesson deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete lesson"
    });
  }
};

export const deleteLessonAttachment = async (req, res) => {
  try {

    const { lessonId, index } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    const attachment = lesson.attachments[index];

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found"
      });
    }

    const filePath = path.join(process.cwd(), attachment.url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    lesson.attachments.splice(index, 1);

    await lesson.save();

    res.json({
      message: "Attachment deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete attachment"
    });
  }
};

/**
 * PATCH /admin/lessons/:lessonId/publish
 */
export const togglePublishLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { isPublished } = req.body;

    if (isPublished) {
      const quiz = await Quiz.findOne({ lessonId }).select("_id");
      if (!quiz) {
        return res.status(400).json({ message: "Add quiz before publishing this lesson" });
      }
    }

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, createdBy: req.user._id },
      { isPublished },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lesson status" });
  }
};

export const uploadLessonFile = async (req, res) => {

  try {

    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }

    const file = req.file;

    lesson.attachments.push({
      name: file.originalname,
      url: `/uploads/${file.filename}`
    }); 

    await lesson.save();

    res.json({
      message: "File uploaded successfully",
      file: lesson.attachments
    });

  } catch (error) {
    res.status(500).json({
      message: "File upload failed"
    });
  }

};

/**
 * POST /admin/lessons/:lessonId/upload-video
 */
export const uploadLessonVideo = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, createdBy: req.user._id });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found or unauthorized" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Video file is required" });
    }

    lesson.videoUrl = `/uploads/videos/${file.filename}`;
    await lesson.save();

    res.json({ message: "Video uploaded successfully", videoUrl: lesson.videoUrl });
  } catch (error) {
    res.status(500).json({ message: "Video upload failed" });
  }
};
