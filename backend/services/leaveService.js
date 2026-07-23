import LeaveRequest from "../models/LeaveRequest.js";
import Staff from "../models/Staff.js";
import Attendance from "../models/Attendance.js";
import ApiError from "../utils/ApiError.js";
import { getOrCreateStaffForUser } from "./attendanceService.js";

const populate = [
  { path: "staff",      select: "firstName lastName staffId department role" },
  { path: "reviewedBy", select: "fullName" },
  { path: "submittedBy",select: "fullName" },
];

const calcDays = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
};

export const createLeaveRequest = async (data, userId) => {
  const staff = await Staff.findById(data.staff);
  if (!staff) throw new ApiError(404, "Staff member not found");

  const totalDays = calcDays(data.startDate, data.endDate);
  if (totalDays <= 0) throw new ApiError(400, "End date must be on or after start date");

  const leave = await LeaveRequest.create({
    ...data,
    totalDays,
    submittedBy: userId,
  });
  return await leave.populate(populate);
};

export const getAllLeaveRequests = async (filters = {}) => {
  const query = {};
  if (filters.status)     query.status           = filters.status;
  if (filters.leaveType)  query.leaveType        = filters.leaveType;
  if (filters.staff)      query.staff            = filters.staff;
  if (filters.startDate)  query.startDate = { $gte: new Date(filters.startDate) };
  if (filters.endDate)    query.endDate   = { $lte: new Date(filters.endDate) };
  return await LeaveRequest.find(query).populate(populate).sort({ createdAt: -1 });
};

export const getLeaveRequestById = async (id) => {
  const leave = await LeaveRequest.findById(id).populate(populate);
  if (!leave) throw new ApiError(404, "Leave request not found");
  return leave;
};

export const getLeaveByStaff = async (staffId) => {
  return await LeaveRequest.find({ staff: staffId }).populate(populate).sort({ createdAt: -1 });
};

const toLocalMidnight = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const reviewLeaveRequest = async (id, status, notes, userId) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw new ApiError(404, "Leave request not found");
  if (leave.status !== "Pending") throw new ApiError(400, "Only pending leave requests can be reviewed");
  if (!["Approved", "Rejected"].includes(status)) throw new ApiError(400, "Status must be Approved or Rejected");

  const updatedLeave = await LeaveRequest.findByIdAndUpdate(
    id,
    { status, reviewedBy: userId, reviewedAt: new Date(), reviewNotes: notes || "" },
    { new: true }
  ).populate(populate);

  if (status === "Approved") {
    const start = toLocalMidnight(leave.startDate);
    const end   = toLocalMidnight(leave.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateCopy = toLocalMidnight(d);
      await Attendance.findOneAndUpdate(
        { staff: leave.staff, date: dateCopy },
        {
          staff: leave.staff,
          date: dateCopy,
          status: "On Leave",
          checkIn: "",
          checkOut: "",
          workHours: 0,
          notes: `${leave.leaveType} Leave (Approved)`,
          recordedBy: userId,
        },
        { upsert: true, new: true }
      );
    }
  }

  return updatedLeave;
};

export const cancelLeaveRequest = async (id, userId) => {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw new ApiError(404, "Leave request not found");
  if (leave.status === "Approved") throw new ApiError(400, "Cannot cancel an approved leave");
  if (leave.status === "Cancelled") throw new ApiError(400, "Already cancelled");

  return await LeaveRequest.findByIdAndUpdate(
    id,
    { status: "Cancelled" },
    { new: true }
  ).populate(populate);
};

export const getLeaveStats = async () => {
  const total     = await LeaveRequest.countDocuments();
  const pending   = await LeaveRequest.countDocuments({ status: "Pending" });
  const approved  = await LeaveRequest.countDocuments({ status: "Approved" });
  const rejected  = await LeaveRequest.countDocuments({ status: "Rejected" });
  const cancelled = await LeaveRequest.countDocuments({ status: "Cancelled" });

  const byType = await LeaveRequest.aggregate([
    { $group: { _id: "$leaveType", count: { $sum: 1 }, totalDays: { $sum: "$totalDays" } } },
    { $sort:  { count: -1 } },
  ]);

  return { total, pending, approved, rejected, cancelled, byType };
};

export const createMyLeaveRequest = async (data, user) => {
  const staff = await getOrCreateStaffForUser(user);
  return await createLeaveRequest({ ...data, staff: staff._id }, user._id);
};

export const getMyLeaveRequests = async (user) => {
  const staff = await getOrCreateStaffForUser(user);
  return await getLeaveByStaff(staff._id);
};

export const cancelMyLeaveRequest = async (id, user) => {
  const staff = await getOrCreateStaffForUser(user);
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw new ApiError(404, "Leave request not found");
  if (leave.staff._id ? leave.staff._id.toString() !== staff._id.toString() : leave.staff.toString() !== staff._id.toString()) {
    throw new ApiError(403, "You can only cancel your own leave requests");
  }
  return await cancelLeaveRequest(id, user._id);
};
