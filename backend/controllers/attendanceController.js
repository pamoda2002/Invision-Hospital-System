import asyncHandler from "../utils/asyncHandler.js";
import {
  markAttendance, getAttendanceByStaff, getAttendanceByDate,
  getAllAttendance, updateAttendance, getAttendanceSummary,
  getMyAttendanceToday, checkInSelf, checkOutSelf,
  getMyAttendanceHistory, getMyAttendanceSummary,
} from "../services/attendanceService.js";

export const mark = asyncHandler(async (req, res) => {
  const record = await markAttendance(req.body, req.user._id);
  res.status(201).json({ success: true, message: "Attendance recorded", record });
});

export const byStaff = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const records = await getAttendanceByStaff(req.params.staffId, { startDate, endDate, month, year });
  res.status(200).json({ success: true, records });
});

export const byDate = asyncHandler(async (req, res) => {
  const records = await getAttendanceByDate(req.params.date);
  res.status(200).json({ success: true, records });
});

export const all = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const records = await getAllAttendance({ startDate, endDate, status });
  res.status(200).json({ success: true, records });
});

export const edit = asyncHandler(async (req, res) => {
  const record = await updateAttendance(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, message: "Attendance updated", record });
});

export const summary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ success: false, message: "month and year are required" });
  }
  const data = await getAttendanceSummary(req.params.staffId, Number(month), Number(year));
  res.status(200).json({ success: true, summary: data });
});

// Self-service
export const getTodaySelf = asyncHandler(async (req, res) => {
  const data = await getMyAttendanceToday(req.user);
  res.status(200).json({ success: true, ...data });
});

export const checkIn = asyncHandler(async (req, res) => {
  const record = await checkInSelf(req.user, req.body);
  res.status(200).json({ success: true, message: "Checked in successfully", record });
});

export const checkOut = asyncHandler(async (req, res) => {
  const record = await checkOutSelf(req.user, req.body);
  res.status(200).json({ success: true, message: "Checked out successfully", record });
});

export const getMyHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate, month, year } = req.query;
  const records = await getMyAttendanceHistory(req.user, { startDate, endDate, month, year });
  res.status(200).json({ success: true, records });
});

export const getMySummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();
  const data = await getMyAttendanceSummary(req.user, month, year);
  res.status(200).json({ success: true, ...data });
});
