import express from "express";
import {
  createPatient,
  getPatients,
  getPatient,
  updatePatientDetails,
  searchPatientList,
} from "../controllers/receptionistPatientController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Read operations - accessible to Receptionist, Doctor, and Administrator
router.get("/", authorizeRoles("Receptionist", "Doctor", "Administrator"), getPatients);
router.get("/search/:keyword", authorizeRoles("Receptionist", "Doctor", "Administrator"), searchPatientList);
router.get("/:id", authorizeRoles("Receptionist", "Doctor", "Administrator"), getPatient);

// Write operations - only for Receptionist
router.post("/", authorizeRoles("Receptionist"), createPatient);
router.put("/:id", authorizeRoles("Receptionist"), updatePatientDetails);

export default router;
