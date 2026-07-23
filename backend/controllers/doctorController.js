import asyncHandler from "../utils/asyncHandler.js";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  searchDoctors,
} from "../services/doctorService.js";

export const addDoctor = asyncHandler(async (req, res) => {
  const doctor = await createDoctor(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Doctor added successfully",
    doctor,
  });
});

export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await getAllDoctors();

  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await getDoctorById(req.params.id);

  res.status(200).json({
    success: true,
    doctor,
  });
});

export const updateDoctorDetails = asyncHandler(async (req, res) => {
  const doctor = await updateDoctor(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Doctor details updated successfully",
    doctor,
  });
});

export const searchDoctorList = asyncHandler(async (req, res) => {
  const doctors = await searchDoctors(req.params.keyword);

  res.status(200).json({
    success: true,
    doctors,
  });
});
