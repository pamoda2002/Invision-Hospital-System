import asyncHandler from "../utils/asyncHandler.js";
import {
  registerPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  searchPatients,
} from "../services/patientService.js";

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await registerPatient(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Patient registered successfully",
    patient,
  });
});

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await getAllPatients();

  res.status(200).json({
    success: true,
    patients,
  });
});

export const getPatient = asyncHandler(async (req, res) => {
  const patient = await getPatientById(req.params.id);

  res.status(200).json({
    success: true,
    patient,
  });
});

export const updatePatientDetails = asyncHandler(async (req, res) => {
  const patient = await updatePatient(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Patient details updated successfully",
    patient,
  });
});

export const searchPatientList = asyncHandler(async (req, res) => {
  const patients = await searchPatients(req.params.keyword);

  res.status(200).json({
    success: true,
    patients,
  });
});
