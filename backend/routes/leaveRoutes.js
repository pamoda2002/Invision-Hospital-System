import express from "express";
import {
  create, getAll, getOne, byStaff, review, cancel, leaveStats,
  createMy, getMy, cancelMy,
} from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);

// Self-service routes (All logged-in staff users)
router.get("/me",           getMy);
router.post("/me",          createMy);
router.put("/me/:id/cancel", cancelMy);

// Administrator-only routes
router.use(authorizeRoles("Administrator"));
router.get("/stats",              leaveStats);
router.get("/",                   getAll);
router.post("/",                  create);
router.get("/staff/:staffId",     byStaff);
router.get("/:id",                getOne);
router.put("/:id/review",         review);
router.put("/:id/cancel",         cancel);

export default router;
