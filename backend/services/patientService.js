import Patient from "../models/Patient.js";
import ApiError from "../utils/ApiError.js";

export const registerPatient = async (patientData, userId) => {
  const existingNic = await Patient.findOne({ nic: patientData.nic });
  if (existingNic) {
    throw new ApiError(400, "NIC already exists");
  }
  
  const existingEmail = await Patient.findOne({ email: patientData.email });
  if (existingEmail) {
    throw new ApiError(400, "Email already exists");
  }

  const patient = await Patient.create({
    ...patientData,
    registeredBy: userId,
  });

  return patient;
};

export const getAllPatients = async () => {
  const patients = await Patient.find().sort({ createdAt: -1 });
  return patients;
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id).populate("registeredBy", "fullName username");
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }
  return patient;
};

export const updatePatient = async (id, patientData) => {
  const patient = await Patient.findById(id);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Check NIC and email uniqueness if they're being updated
  if (patientData.nic && patientData.nic !== patient.nic) {
    const existingNic = await Patient.findOne({ nic: patientData.nic });
    if (existingNic) {
      throw new ApiError(400, "NIC already exists");
    }
  }
  
  if (patientData.email && patientData.email !== patient.email) {
    const existingEmail = await Patient.findOne({ email: patientData.email });
    if (existingEmail) {
      throw new ApiError(400, "Email already exists");
    }
  }

  const updatedPatient = await Patient.findByIdAndUpdate(id, patientData, {
    new: true,
    runValidators: true,
  });

  return updatedPatient;
};

export const searchPatients = async (keyword) => {
  const searchQuery = {
    $or: [
      { patientId: { $regex: keyword, $options: "i" } },
      { nic: { $regex: keyword, $options: "i" } },
      { firstName: { $regex: keyword, $options: "i" } },
      { lastName: { $regex: keyword, $options: "i" } },
      { phone: { $regex: keyword, $options: "i" } },
    ],
  };

  const patients = await Patient.find(searchQuery).sort({ createdAt: -1 });
  return patients;
};
