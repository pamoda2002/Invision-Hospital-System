import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctor,
  updateDoctorDetails,
  searchDoctorList,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// These routes are accessible to Receptionist, Doctor, and Administrator
router.get("/", authorizeRoles("Receptionist", "Doctor", "Administrator"), getDoctors);
router.get("/search/:keyword", authorizeRoles("Receptionist", "Doctor", "Administrator"), searchDoctorList);
router.get("/:id", authorizeRoles("Receptionist", "Doctor", "Administrator"), getDoctor);

// These routes are only for Administrators
router.post("/", authorizeRoles("Administrator"), addDoctor);
router.put("/:id", authorizeRoles("Administrator"), updateDoctorDetails);

export default router;
