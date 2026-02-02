import { Router } from "express";
import authRoutes from "../routes/auth.routes.js"
import resumeRoutes from "../routes/resume.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/resume", resumeRoutes)
export default router;