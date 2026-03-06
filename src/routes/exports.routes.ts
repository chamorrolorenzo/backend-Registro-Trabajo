import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { downloadHoursPdf, downloadTripsPdf } from "../controllers/exports.controller.js";

const router = Router();

router.get("/exports/hours", authMiddleware, downloadHoursPdf);
router.get("/exports/trips", authMiddleware, downloadTripsPdf);

export default router;