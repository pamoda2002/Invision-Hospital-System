import asyncHandler from "../utils/asyncHandler.js";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentsByDoctor,
  getAppointmentById,
  updateAppointment,
  searchAppointments,
} from "../services/appointmentService.js";
import Doctor from "../models/Doctor.js";

export const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await createAppointment(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment,
  });
});

export const getAppointments = asyncHandler(async (req, res) => {
  let appointments;

  if (req.user.role === "Doctor") {
    // Find Doctor record by linked user ID first, then by email as fallback
    let doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      doctor = await Doctor.findOne({ email: req.user.email });
    }
    if (doctor) {
      appointments = await getAppointmentsByDoctor(doctor._id);
    } else {
      appointments = [];
    }
  } else {
    appointments = await getAllAppointments();
  }

  res.status(200).json({
    success: true,
    appointments,
  });
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await getAppointmentById(req.params.id);

  res.status(200).json({
    success: true,
    appointment,
  });
});

export const updateAppointmentDetails = asyncHandler(async (req, res) => {
  const appointment = await updateAppointment(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Appointment updated successfully",
    appointment,
  });
});

export const searchAppointmentList = asyncHandler(async (req, res) => {
  let appointments;

  if (req.user.role === "Doctor") {
    // Find Doctor record by linked user ID first, then by email as fallback
    let doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      doctor = await Doctor.findOne({ email: req.user.email });
    }
    if (doctor) {
      const allAppointments = await searchAppointments(req.params.keyword);
      // Filter appointments by this doctor
      appointments = allAppointments.filter(
        (apt) => apt.doctor._id.toString() === doctor._id.toString()
      );
    } else {
      appointments = [];
    }
  } else {
    appointments = await searchAppointments(req.params.keyword);
  }

  res.status(200).json({
    success: true,
    appointments,
  });
});
