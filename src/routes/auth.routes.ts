import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import { Request, Response } from "express";

import {
  login,
  register,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

/* =========================
   AUTH
========================= */

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// USERS CRUD 
/* GET USERS (con query params) */
router.get("/users", async (req: Request, res: Response) => {
  try {
    const { role, username, email } = req.query;

    const filter: any = {};

    if (role && typeof role === "string") {
      filter.role = role;
    }

    if (username && typeof username === "string") {
      filter.username = new RegExp(username, "i");
    }

    if (email && typeof email === "string") {
      filter.email = new RegExp(email, "i");
    }

    const users = await User.find(filter).select("-password");

    res.json(users);

  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
});

/* UPDATE USER */
router.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
});

/* DELETE USER */
router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
});

export default router;