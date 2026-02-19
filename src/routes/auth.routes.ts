import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  login,
  register,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
//router.get("/me", authMiddleware, me);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
