import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import ApiError from "../utils/ApiError.js";
import { DEFAULT_STAFF_PASSWORD } from "../utils/staffAuth.js";

export const createDoctor = async (doctorData, userId) => {
  const existingPhone = await Doctor.findOne({ phone: doctorData.phone });
  if (existingPhone) {
    throw new ApiError(400, "Phone number already exists");
  }

  const existingEmail = await Doctor.findOne({ email: doctorData.email });
  if (existingEmail) {
    throw new ApiError(400, "Email already exists");
  }

  // Check if a User already exists with this email
  const existingUser = await User.findOne({ email: doctorData.email });
  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  // Create User account for doctor
  const user = await User.create({
    fullName: `${doctorData.firstName} ${doctorData.lastName}`,
    username: doctorData.email, // Use email as username
    email: doctorData.email,
    password: DEFAULT_STAFF_PASSWORD,
    role: "Doctor",
  });

  // Create Doctor record and link to User
  const doctor = await Doctor.create({
    ...doctorData,
    createdBy: userId,
    user: user._id,
  });

  // Auto-create a Staff record so doctor appears in Staff Management
  const existingStaff = await Staff.findOne({ email: doctorData.email });
  if (!existingStaff) {
    await Staff.create({
      user:           user._id,
      firstName:      doctorData.firstName,
      lastName:       doctorData.lastName,
      email:          doctorData.email,
      phone:          doctorData.phone || "",
      role:           "Doctor",
      department:     "Medical",
      designation:    doctorData.specialization || "Doctor",
      employmentType: "Full-Time",
      joinDate:       new Date(),
      status:         "Active",
    });
  }

  return doctor;
};

export const getAllDoctors = async () => {
  const doctors = await Doctor.find().sort({ createdAt: -1 });
  return doctors;
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id).populate("createdBy", "fullName username");
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }
  return doctor;
};

export const updateDoctor = async (id, doctorData) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  if (doctorData.phone && doctorData.phone !== doctor.phone) {
    const existingPhone = await Doctor.findOne({ phone: doctorData.phone });
    if (existingPhone) {
      throw new ApiError(400, "Phone number already exists");
    }
  }

  if (doctorData.email && doctorData.email !== doctor.email) {
    const existingEmail = await Doctor.findOne({ email: doctorData.email });
    if (existingEmail) {
      throw new ApiError(400, "Email already exists");
    }
    // Check if User exists with new email
    const existingUser = await User.findOne({ email: doctorData.email });
    if (existingUser) {
      throw new ApiError(400, "User already exists with this email");
    }
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(id, doctorData, {
    new: true,
    runValidators: true,
  });

  // Update linked User account if it exists
  if (doctor.user) {
    const updateData = {};
    if (doctorData.firstName && doctorData.lastName) {
      updateData.fullName = `${doctorData.firstName} ${doctorData.lastName}`;
    } else if (doctorData.firstName) {
      updateData.fullName = `${doctorData.firstName} ${doctor.lastName}`;
    } else if (doctorData.lastName) {
      updateData.fullName = `${doctor.firstName} ${doctorData.lastName}`;
    }
    if (doctorData.email) {
      updateData.username = doctorData.email;
      updateData.email = doctorData.email;
    }
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(doctor.user, updateData, { new: true });
    }
  }

  return updatedDoctor;
};

export const searchDoctors = async (keyword) => {
  const searchQuery = {
    $or: [
      { doctorId: { $regex: keyword, $options: "i" } },
      { firstName: { $regex: keyword, $options: "i" } },
      { lastName: { $regex: keyword, $options: "i" } },
      { specialization: { $regex: keyword, $options: "i" } },
      { department: { $regex: keyword, $options: "i" } },
    ],
  };

  const doctors = await Doctor.find(searchQuery).sort({ createdAt: -1 });
  return doctors;
};
