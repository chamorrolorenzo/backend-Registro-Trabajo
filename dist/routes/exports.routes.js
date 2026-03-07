import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { downloadHoursPdf, downloadTripsPdf } from "../controllers/exports.controller.js";
const router = Router();
router.get("/hours", authMiddleware, downloadHoursPdf);
router.get("/trips", authMiddleware, downloadTripsPdf);
export default router;
