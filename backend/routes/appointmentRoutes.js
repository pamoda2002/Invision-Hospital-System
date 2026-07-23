import express from "express";
import {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentDetails,
  searchAppointmentList,
} from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Receptionist and Admin routes
router.route("/")
  .post(authorizeRoles("Receptionist", "Administrator"), bookAppointment)
  .get(authorizeRoles("Receptionist", "Administrator", "Doctor"), getAppointments);

router.get("/search/:keyword", authorizeRoles("Receptionist", "Administrator", "Doctor"), searchAppointmentList);

router.route("/:id")
  .get(authorizeRoles("Receptionist", "Administrator", "Doctor"), getAppointment)
  .put(authorizeRoles("Receptionist", "Administrator", "Doctor"), updateAppointmentDetails);

export default router;
