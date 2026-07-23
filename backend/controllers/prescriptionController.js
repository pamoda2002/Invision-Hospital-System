import asyncHandler from "../utils/asyncHandler.js";
import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
  getPrescriptionById,
  getPendingPrescriptions,
  dispensePrescription,
  cancelPrescription,
  getPrescriptionStats,
} from "../services/prescriptionService.js";

export const addPrescription = asyncHandler(async (req, res) => {
  const prescription = await createPrescription(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    prescription,
  });
});

export const getPrescriptions = asyncHandler(async (req, res) => {
  const filters = { status: req.query.status };
  const prescriptions = await getAllPrescriptions(filters);

  res.status(200).json({
    success: true,
    prescriptions,
  });
});

export const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await getPrescriptionsByDoctor(req.user._id);

  res.status(200).json({
    success: true,
    prescriptions,
  });
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await getPrescriptionsByPatient(req.params.patientId);

  res.status(200).json({
    success: true,
    prescriptions,
  });
});

export const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await getPrescriptionById(req.params.id);

  res.status(200).json({
    success: true,
    prescription,
  });
});

export const getPending = asyncHandler(async (req, res) => {
  const prescriptions = await getPendingPrescriptions();

  res.status(200).json({
    success: true,
    prescriptions,
  });
});

export const dispense = asyncHandler(async (req, res) => {
  const prescription = await dispensePrescription(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Prescription dispensed successfully",
    prescription,
  });
});

export const cancel = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const prescription = await cancelPrescription(req.params.id, reason, req.user._id);

  res.status(200).json({
    success: true,
    message: "Prescription cancelled successfully",
    prescription,
  });
});

export const getPharmacyStats = asyncHandler(async (req, res) => {
  const stats = await getPrescriptionStats();

  res.status(200).json({
    success: true,
    stats,
  });
});
