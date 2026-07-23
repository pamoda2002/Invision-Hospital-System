import asyncHandler from "../utils/asyncHandler.js";
import {
  createLaboratoryTest,
  getLaboratoryTestsByDoctor,
  getLaboratoryTestsByPatient,
  getAllLaboratoryTests,
  getLaboratoryTestById,
  updateLaboratoryTest,
  recordSampleCollection,
  enterTestResults,
  getPendingTests,
  getTestsByStatus,
  cancelLaboratoryTest,
} from "../services/laboratoryService.js";

export const createTest = asyncHandler(async (req, res) => {
  const test = await createLaboratoryTest(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Laboratory test requested successfully",
    test,
  });
});

export const getDoctorTests = asyncHandler(async (req, res) => {
  const tests = await getLaboratoryTestsByDoctor(req.user._id);

  res.status(200).json({
    success: true,
    tests,
  });
});

export const getPatientTests = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const tests = await getLaboratoryTestsByPatient(patientId);

  res.status(200).json({
    success: true,
    tests,
  });
});

export const getAllTests = asyncHandler(async (req, res) => {
  const tests = await getAllLaboratoryTests();

  res.status(200).json({
    success: true,
    tests,
  });
});

export const getTestById = asyncHandler(async (req, res) => {
  const test = await getLaboratoryTestById(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    success: true,
    test,
  });
});

export const updateTest = asyncHandler(async (req, res) => {
  const test = await updateLaboratoryTest(req.params.id, req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: "Laboratory test updated successfully",
    test,
  });
});

export const collectSample = asyncHandler(async (req, res) => {
  const test = await recordSampleCollection(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Sample collected successfully",
    test,
  });
});

export const enterResults = asyncHandler(async (req, res) => {
  const test = await enterTestResults(req.params.id, req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: "Test results entered successfully",
    test,
  });
});

export const getPending = asyncHandler(async (req, res) => {
  const tests = await getPendingTests();

  res.status(200).json({
    success: true,
    tests,
  });
});

export const getTestsByStatusFilter = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const tests = await getTestsByStatus(status);

  res.status(200).json({
    success: true,
    tests,
  });
});

export const cancelTest = asyncHandler(async (req, res) => {
  const test = await cancelLaboratoryTest(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Laboratory test cancelled successfully",
    test,
  });
});
