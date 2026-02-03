import { Router } from "express"
import authMiddleware from "../middlewares/authMiddleware.js"
import { register, login, me } from "../controllers/auth.controller.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, me)

export default router
