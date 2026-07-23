import { Router } from "express";
import { login, logout, profile, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { USER_ROLES } from "../models/User.js";

const router = Router();

router.post("/register", protect, authorizeRoles("Administrator"), register);
router.post("/login", login);
router.get("/profile", protect, authorizeRoles(...USER_ROLES), profile);
router.post("/logout", logout);

export default router;
