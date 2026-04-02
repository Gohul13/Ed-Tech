import express from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { sendRiskNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/risk", requireAuth, requireAdmin, sendRiskNotification);

export default router;

