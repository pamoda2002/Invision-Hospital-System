import express from "express";
import {
  addPrescription,
  getPrescriptions,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescription,
  getPending,
  dispense,
  cancel,
  getPharmacyStats,
} from "../controllers/prescriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Stats — Pharmacist & Administrator
router.get("/stats", authorizeRoles("Pharmacist", "Administrator"), getPharmacyStats);

// Pending prescriptions queue — Pharmacist
router.get("/pending", authorizeRoles("Pharmacist", "Administrator"), getPending);

// Doctor — view own prescriptions
router.get("/doctor", authorizeRoles("Doctor"), getDoctorPrescriptions);

// By patient — Doctor, Pharmacist, Administrator
router.get(
  "/patient/:patientId",
  authorizeRoles("Doctor", "Pharmacist", "Administrator"),
  getPatientPrescriptions
);

// All prescriptions — Pharmacist & Administrator only
router.get("/", authorizeRoles("Pharmacist", "Administrator"), getPrescriptions);

// Single prescription — Doctor, Pharmacist, Administrator
router.get(
  "/:id",
  authorizeRoles("Doctor", "Pharmacist", "Administrator"),
  getPrescription
);

// Doctor — create prescription
router.post("/", authorizeRoles("Doctor"), addPrescription);

// Pharmacist — dispense and cancel
router.put("/:id/dispense", authorizeRoles("Pharmacist"), dispense);
router.put("/:id/cancel", authorizeRoles("Pharmacist", "Administrator", "Doctor"), cancel);

export default router;
