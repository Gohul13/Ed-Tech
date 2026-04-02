import express from "express";
import authRoutes from "./routes/authRoutes.js"
import { requireAuth,requireAdmin } from "./middleware/authMiddleware.js";
import courseRoutes from "./routes/courseRoutes.js";
import adminCourseRoutes from "./routes/adminCourseRoutes.js";
import adminLessonRoutes from "./routes/adminLessonRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import finalTestRoutes from "./routes/finalTestRoutes.js";

const app = express();

// CORS - allow frontend (Vite default port) to call this API
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json()); 
app.use("/auth",authRoutes);
app.use("/courses", courseRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "ok" });  
});
app.get("/protected", requireAuth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});
app.get("/admin-test", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});
app.use("/admin",adminCourseRoutes);
app.use("/admin",adminLessonRoutes);
app.use("/courses", lessonRoutes);
app.use("/", enrollmentRoutes);
app.use("/", quizRoutes);
app.use("/", finalTestRoutes);
app.use("/admin", adminAnalyticsRoutes);
app.use("/admin/ml", mlRoutes);
app.use("/admin/notifications", notificationRoutes);
app.use("/uploads", express.static("uploads"));


export default app;   
