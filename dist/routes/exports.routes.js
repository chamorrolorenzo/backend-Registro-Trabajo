import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { downloadHoursPdf, downloadTripsPdf, downloadMonthlyPdf, } from "../controllers/exports.controller.js";
const router = Router();
router.get("/hours", authMiddleware, downloadHoursPdf);
router.get("/trips", authMiddleware, downloadTripsPdf);
router.get("/monthly", authMiddleware, downloadMonthlyPdf);
export default router;
