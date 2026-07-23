import express from "express";
import {
  addStaff, getStaff, getStaffMember, editStaff, removeStaff, stats, repairAccounts,
} from "../controllers/staffController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.use(authorizeRoles("Administrator"));

router.get("/stats",  stats);
router.post("/repair", repairAccounts); // Fix staff missing User accounts
router.get("/",       getStaff);
router.post("/",     addStaff);
router.get("/:id",   getStaffMember);
router.put("/:id",   editStaff);
router.delete("/:id",removeStaff);

export default router;
