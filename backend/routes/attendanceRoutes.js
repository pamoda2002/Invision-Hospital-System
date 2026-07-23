import express from "express";
import {
  mark, byStaff, byDate, all, edit, summary,
  getTodaySelf, checkIn, checkOut, getMyHistory, getMySummary,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);

// Self-service routes (All logged-in staff users)
router.get("/me/today",      getTodaySelf);
router.post("/me/check-in",  checkIn);
router.post("/me/check-out", checkOut);
router.get("/me/history",   getMyHistory);
router.get("/me/summary",   getMySummary);

// Administrator-only routes
router.use(authorizeRoles("Administrator"));
router.get("/",                     all);
router.post("/",                    mark);
router.get("/date/:date",           byDate);
router.get("/staff/:staffId",       byStaff);
router.get("/staff/:staffId/summary", summary);
router.put("/:id",                  edit);

export default router;
