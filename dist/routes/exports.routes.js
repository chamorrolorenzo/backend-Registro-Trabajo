// src/routes/exports.routes.ts
import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { downloadHoursPdf, downloadTripsPdf } from "../controllers/exports.controller.js";
const router = Router();
// ✅ /api/exports/hours.pdf?month=3&year=2026
router.get("/exports/hours.pdf", authMiddleware, downloadHoursPdf);
// ✅ /api/exports/trips.pdf?month=3&year=2026
router.get("/exports/trips.pdf", authMiddleware, downloadTripsPdf);
export default router;
