import multer from "multer";
import fs from "fs";
import path from "path";

const videosDir = path.join(process.cwd(), "uploads", "videos");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync(videosDir, { recursive: true });
      cb(null, videosDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const safeOriginal = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}-${safeOriginal}`);
  }
});

function fileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith("video/")) return cb(null, true);
  cb(new Error("Only video files are allowed"));
}

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

export default uploadVideo;

