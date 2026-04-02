import express from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { getMLDataset, predictDropout, getDropoutRiskStudents } from "../controllers/mlController.js";
const router = express.Router();

router.get("/dataset", requireAuth, requireAdmin, getMLDataset);
router.get("/predict-dropout", requireAuth, requireAdmin, predictDropout);
router.get("/dropout-risk-students", requireAuth, requireAdmin, getDropoutRiskStudents);
export default router;    