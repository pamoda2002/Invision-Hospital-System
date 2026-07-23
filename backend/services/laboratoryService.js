import LaboratoryTest from "../models/LaboratoryTest.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import ApiError from "../utils/ApiError.js";

export const createLaboratoryTest = async (testData, userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const laboratoryTest = await LaboratoryTest.create({
    ...testData,
    doctor: doctor._id,
  });

  return await laboratoryTest.populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
    { path: "sampleCollectedBy", select: "fullName" },
    { path: "completedBy", select: "fullName" },
  ]);
};

export const getLaboratoryTestsByDoctor = async (userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    return [];
  }

  // Find all patients who have appointments with this doctor
  const appointments = await Appointment.find({ doctor: doctor._id }).distinct("patient");

  // Return lab tests only for those patients
  return await LaboratoryTest.find({ patient: { $in: appointments } })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
      { path: "sampleCollectedBy", select: "fullName" },
      { path: "completedBy", select: "fullName" },
    ])
    .sort({ createdAt: -1 });
};

export const getLaboratoryTestsByPatient = async (patientId) => {
  return await LaboratoryTest.find({ patient: patientId })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
      { path: "sampleCollectedBy", select: "fullName" },
      { path: "completedBy", select: "fullName" },
    ])
    .sort({ createdAt: -1 });
};

export const getAllLaboratoryTests = async () => {
  return await LaboratoryTest.find({})
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
      { path: "sampleCollectedBy", select: "fullName" },
      { path: "completedBy", select: "fullName" },
    ])
    .sort({ createdAt: -1 });
};

export const getLaboratoryTestById = async (id, userId = null, userRole = null) => {
  const test = await LaboratoryTest.findById(id).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
    { path: "sampleCollectedBy", select: "fullName" },
    { path: "completedBy", select: "fullName" },
  ]);

  if (!test) {
    throw new ApiError(404, "Laboratory test not found");
  }

  // If the caller is a doctor, verify they have an appointment with this patient
  if (userRole === "Doctor") {
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      throw new ApiError(403, "Doctor profile not found");
    }
    const hasAppointment = await Appointment.exists({
      doctor: doctor._id,
      patient: test.patient._id,
    });
    if (!hasAppointment) {
      throw new ApiError(403, "You are not authorized to view this test");
    }
  }

  return test;
};

export const updateLaboratoryTest = async (id, testData, userId) => {
  const test = await LaboratoryTest.findById(id);
  if (!test) {
    throw new ApiError(404, "Laboratory test not found");
  }

  const updatedTest = await LaboratoryTest.findByIdAndUpdate(id, testData, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
    { path: "sampleCollectedBy", select: "fullName" },
    { path: "completedBy", select: "fullName" },
  ]);

  return updatedTest;
};

export const recordSampleCollection = async (id, userId) => {
  const test = await LaboratoryTest.findById(id);
  if (!test) {
    throw new ApiError(404, "Laboratory test not found");
  }

  if (test.status !== "Pending") {
    throw new ApiError(400, "Sample can only be collected for pending tests");
  }

  const updatedTest = await LaboratoryTest.findByIdAndUpdate(
    id,
    {
      status: "Sample Collected",
      sampleCollectedAt: new Date(),
      sampleCollectedBy: userId,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
    { path: "sampleCollectedBy", select: "fullName" },
    { path: "completedBy", select: "fullName" },
  ]);

  return updatedTest;
};

export const enterTestResults = async (id, resultsData, userId) => {
  const test = await LaboratoryTest.findById(id);
  if (!test) {
    throw new ApiError(404, "Laboratory test not found");
  }

  if (test.status === "Completed" || test.status === "Cancelled") {
    throw new ApiError(400, "Cannot enter results for completed or cancelled tests");
  }

  const updatedTest = await LaboratoryTest.findByIdAndUpdate(
    id,
    {
      ...resultsData,
      status: "Completed",
      completedAt: new Date(),
      completedBy: userId,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
    { path: "sampleCollectedBy", select: "fullName" },
    { path: "completedBy", select: "fullName" },
  ]);

  return updatedTest;
};

export const getPendingTests = async () => {
  return await LaboratoryTest.find({ status: "Pending" })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
    ])
    .sort({ priority: -1, createdAt: 1 });
};

export const getTestsByStatus = async (status) => {
  return await LaboratoryTest.find({ status })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
      { path: "sampleCollectedBy", select: "fullName" },
      { path: "completedBy", select: "fullName" },
    ])
    .sort({ createdAt: -1 });
};

export const cancelLaboratoryTest = async (id, userId) => {
  const test = await LaboratoryTest.findById(id);
  if (!test) {
    throw new ApiError(404, "Laboratory test not found");
  }

  if (test.status === "Completed") {
    throw new ApiError(400, "Cannot cancel completed tests");
  }

  const updatedTest = await LaboratoryTest.findByIdAndUpdate(
    id,
    { status: "Cancelled" },
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
  ]);

  return updatedTest;
};
