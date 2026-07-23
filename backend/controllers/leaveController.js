import asyncHandler from "../utils/asyncHandler.js";
import {
  createLeaveRequest, getAllLeaveRequests, getLeaveRequestById,
  getLeaveByStaff, reviewLeaveRequest, cancelLeaveRequest, getLeaveStats,
  createMyLeaveRequest, getMyLeaveRequests, cancelMyLeaveRequest,
} from "../services/leaveService.js";

export const create = asyncHandler(async (req, res) => {
  const leave = await createLeaveRequest(req.body, req.user._id);
  res.status(201).json({ success: true, message: "Leave request submitted", leave });
});

export const getAll = asyncHandler(async (req, res) => {
  const { status, leaveType, staff, startDate, endDate } = req.query;
  const leaves = await getAllLeaveRequests({ status, leaveType, staff, startDate, endDate });
  res.status(200).json({ success: true, leaves });
});

export const getOne = asyncHandler(async (req, res) => {
  const leave = await getLeaveRequestById(req.params.id);
  res.status(200).json({ success: true, leave });
});

export const byStaff = asyncHandler(async (req, res) => {
  const leaves = await getLeaveByStaff(req.params.staffId);
  res.status(200).json({ success: true, leaves });
});

export const review = asyncHandler(async (req, res) => {
  const { status, reviewNotes } = req.body;
  const leave = await reviewLeaveRequest(req.params.id, status, reviewNotes, req.user._id);
  res.status(200).json({ success: true, message: `Leave request ${status.toLowerCase()}`, leave });
});

export const cancel = asyncHandler(async (req, res) => {
  const leave = await cancelLeaveRequest(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: "Leave request cancelled", leave });
});

export const leaveStats = asyncHandler(async (req, res) => {
  const data = await getLeaveStats();
  res.status(200).json({ success: true, stats: data });
});

// Self-service
export const createMy = asyncHandler(async (req, res) => {
  const leave = await createMyLeaveRequest(req.body, req.user);
  res.status(201).json({ success: true, message: "Leave request submitted successfully", leave });
});

export const getMy = asyncHandler(async (req, res) => {
  const leaves = await getMyLeaveRequests(req.user);
  res.status(200).json({ success: true, leaves });
});

export const cancelMy = asyncHandler(async (req, res) => {
  const leave = await cancelMyLeaveRequest(req.params.id, req.user);
  res.status(200).json({ success: true, message: "Leave request cancelled", leave });
});
