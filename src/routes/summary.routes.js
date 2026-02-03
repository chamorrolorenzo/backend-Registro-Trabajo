import { Router } from "express";
import { getSummary } from "../controllers/summary.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getSummary);

export default router;
