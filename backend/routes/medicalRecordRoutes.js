import express from "express";
import {
  addMedicalRecord,
  getDoctorMedicalRecords,
  getPatientMedicalRecords,
  getMedicalRecord,
  updateMedicalRecordDetails,
  searchMedicalRecordList,
} from "../controllers/medicalRecordController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Doctor only routes (except maybe viewing patient history for others?)
router.get("/", authorizeRoles("Doctor", "Administrator"), getDoctorMedicalRecords);
router.get("/search/:keyword", authorizeRoles("Doctor", "Administrator"), searchMedicalRecordList);
router.get("/patient/:patientId", authorizeRoles("Doctor", "Receptionist", "Administrator"), getPatientMedicalRecords);
router.get("/:id", authorizeRoles("Doctor", "Receptionist", "Administrator"), getMedicalRecord);
router.post("/", authorizeRoles("Doctor", "Administrator"), addMedicalRecord);
router.put("/:id", authorizeRoles("Doctor", "Administrator"), updateMedicalRecordDetails);

export default router;
