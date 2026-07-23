import express from "express";
import {
  createTest,
  getDoctorTests,
  getPatientTests,
  getAllTests,
  getTestById,
  updateTest,
  collectSample,
  enterResults,
  getPending,
  getTestsByStatusFilter,
  cancelTest,
} from "../controllers/laboratoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Doctor routes - Create and view tests
router.post("/", authorizeRoles("Doctor"), createTest);
router.get("/doctor", authorizeRoles("Doctor"), getDoctorTests);

// Laboratory Staff routes - Manage tests
router.get("/pending", authorizeRoles("Laboratory Staff", "Administrator"), getPending);
router.get("/status/:status", authorizeRoles("Laboratory Staff", "Administrator"), getTestsByStatusFilter);
router.put("/:id/collect-sample", authorizeRoles("Laboratory Staff"), collectSample);
router.put("/:id/enter-results", authorizeRoles("Laboratory Staff"), enterResults);

// Common routes - View specific test
router.get("/:id", authorizeRoles("Doctor", "Laboratory Staff", "Administrator"), getTestById);
router.get("/patient/:patientId", authorizeRoles("Doctor", "Laboratory Staff", "Administrator"), getPatientTests);

// Administrator routes - View all tests
router.get("/", authorizeRoles("Administrator"), getAllTests);

// Update and cancel routes
router.put("/:id", authorizeRoles("Doctor", "Administrator"), updateTest);
router.put("/:id/cancel", authorizeRoles("Doctor", "Administrator"), cancelTest);

export default router;
