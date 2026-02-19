import { Router } from "express";
import { createTrip, getTrips, updateTrip, deleteTrip, } from "../controllers/trips.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", authMiddleware, getTrips);
router.post("/", authMiddleware, createTrip);
router.patch("/:id", authMiddleware, updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);
export default router;
