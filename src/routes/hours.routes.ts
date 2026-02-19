import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getHours,
  createHour,
  updateHour,
  deleteHour,
  entryHour,
  exitHour,
} from "../controllers/hours.controller.js";

const router = Router();

/* ---- LISTADO ---- */
router.get("/", authMiddleware, getHours);

/* ---- CRUD  ---- */
router.post("/", authMiddleware, createHour);
router.patch("/:id", authMiddleware, updateHour);
router.delete("/:id", authMiddleware, deleteHour);

/* ---- CLOCK IN / CLOCK OUT ---- */
router.post("/entry", authMiddleware, entryHour);
router.post("/exit", authMiddleware, exitHour);

export default router;
