import MedicalRecord from "../models/MedicalRecord.js";
import Doctor from "../models/Doctor.js";
import ApiError from "../utils/ApiError.js";

export const createMedicalRecord = async (recordData, userId) => {
  // Find doctor by linked user ID
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const medicalRecord = await MedicalRecord.create({
    ...recordData,
    doctor: doctor._id,
  });

  return await medicalRecord.populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
  ]);
};

export const getMedicalRecordsByPatient = async (patientId) => {
  return await MedicalRecord.find({ patient: patientId })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
    ])
    .sort({ date: -1 });
};

export const getMedicalRecordsByDoctor = async (userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    return [];
  }

  return await MedicalRecord.find({ doctor: doctor._id })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
    ])
    .sort({ date: -1 });
};

export const getMedicalRecordById = async (id) => {
  const record = await MedicalRecord.findById(id).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
  ]);

  if (!record) {
    throw new ApiError(404, "Medical record not found");
  }
  return record;
};

export const updateMedicalRecord = async (id, recordData, userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const record = await MedicalRecord.findById(id);
  if (!record) {
    throw new ApiError(404, "Medical record not found");
  }

  if (record.doctor.toString() !== doctor._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this record");
  }

  const updatedRecord = await MedicalRecord.findByIdAndUpdate(id, recordData, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization" },
  ]);

  return updatedRecord;
};

export const searchMedicalRecords = async (keyword, userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  const searchQuery = {
    $or: [
      { recordId: { $regex: keyword, $options: "i" } },
      { diagnosis: { $regex: keyword, $options: "i" } },
      { symptoms: { $regex: keyword, $options: "i" } },
    ],
  };

  if (doctor) {
    searchQuery.doctor = doctor._id;
  }

  return await MedicalRecord.find(searchQuery)
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization" },
    ])
    .sort({ date: -1 });
};
