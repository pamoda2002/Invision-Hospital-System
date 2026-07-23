import asyncHandler from "../utils/asyncHandler.js";
import {
  createStaff, getAllStaff, getStaffById,
  updateStaff, deleteStaff, getStaffStats, repairStaffAccounts,
} from "../services/staffService.js";

export const addStaff = asyncHandler(async (req, res) => {
  const staff = await createStaff(req.body);
  res.status(201).json({ success: true, message: "Staff member registered successfully", staff });
});

export const repairAccounts = asyncHandler(async (req, res) => {
  const results = await repairStaffAccounts();
  res.status(200).json({ success: true, message: "Repair complete", results });
});

export const getStaff = asyncHandler(async (req, res) => {
  const { department, role, status, search } = req.query;
  const staff = await getAllStaff({ department, role, status, search });
  res.status(200).json({ success: true, staff });
});

export const getStaffMember = asyncHandler(async (req, res) => {
  const staff = await getStaffById(req.params.id);
  res.status(200).json({ success: true, staff });
});

export const editStaff = asyncHandler(async (req, res) => {
  const staff = await updateStaff(req.params.id, req.body);
  res.status(200).json({ success: true, message: "Staff member updated successfully", staff });
});

export const removeStaff = asyncHandler(async (req, res) => {
  await deleteStaff(req.params.id);
  res.status(200).json({ success: true, message: "Staff member deactivated" });
});

export const stats = asyncHandler(async (req, res) => {
  const data = await getStaffStats();
  res.status(200).json({ success: true, stats: data });
});
