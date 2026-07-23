import express from "express";
import {
  patientReport, appointmentReport, revenueReport,
  pharmacyReport, laboratoryReport, staffReport,
} from "../controllers/reportsController.js";
import { protect }      from "../middleware/authMiddleware.js";
import authorizeRoles   from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.use(authorizeRoles("Administrator"));

router.get("/patients",     patientReport);
router.get("/appointments", appointmentReport);
router.get("/revenue",      revenueReport);
router.get("/pharmacy",     pharmacyReport);
router.get("/laboratory",   laboratoryReport);
router.get("/staff",        staffReport);

export default router;
