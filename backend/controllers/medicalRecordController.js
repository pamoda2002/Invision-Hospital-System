import asyncHandler from "../utils/asyncHandler.js";
import {
  createMedicalRecord,
  getMedicalRecordsByPatient,
  getMedicalRecordsByDoctor,
  getMedicalRecordById,
  updateMedicalRecord,
  searchMedicalRecords,
} from "../services/medicalRecordService.js";

export const addMedicalRecord = asyncHandler(async (req, res) => {
  const record = await createMedicalRecord(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Medical record created successfully",
    record,
  });
});

export const getDoctorMedicalRecords = asyncHandler(async (req, res) => {
  const records = await getMedicalRecordsByDoctor(req.user._id);

  res.status(200).json({
    success: true,
    records,
  });
});

export const getPatientMedicalRecords = asyncHandler(async (req, res) => {
  const records = await getMedicalRecordsByPatient(req.params.patientId);

  res.status(200).json({
    success: true,
    records,
  });
});

export const getMedicalRecord = asyncHandler(async (req, res) => {
  const record = await getMedicalRecordById(req.params.id);

  res.status(200).json({
    success: true,
    record,
  });
});

export const updateMedicalRecordDetails = asyncHandler(async (req, res) => {
  const record = await updateMedicalRecord(req.params.id, req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: "Medical record updated successfully",
    record,
  });
});

export const searchMedicalRecordList = asyncHandler(async (req, res) => {
  const records = await searchMedicalRecords(req.params.keyword, req.user._id);

  res.status(200).json({
    success: true,
    records,
  });
});
