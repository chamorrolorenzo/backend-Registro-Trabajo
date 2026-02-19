import { Router } from "express";
import { getSummary, getSummaryPeriods } from "../controllers/summary.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", authMiddleware, getSummary);
router.get("/periods", authMiddleware, getSummaryPeriods);
export default router;
