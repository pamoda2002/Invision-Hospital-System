import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import ApiError from "../utils/ApiError.js";

const populate = [
  { path: "staff",      select: "firstName lastName staffId department role" },
  { path: "recordedBy", select: "fullName" },
];

export const markAttendance = async (data, userId) => {
  const staff = await Staff.findById(data.staff);
  if (!staff) throw new ApiError(404, "Staff member not found");

  // Normalise date to midnight
  const date = new Date(data.date);
  date.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({ staff: data.staff, date });
  if (existing) {
    return await Attendance.findByIdAndUpdate(
      existing._id,
      { ...data, date, recordedBy: userId },
      { new: true, runValidators: true }
    ).populate(populate);
  }

  // Calculate work hours from checkIn / checkOut
  let workHours = 0;
  if (data.checkIn && data.checkOut) {
    const [inH, inM]   = data.checkIn.split(":").map(Number);
    const [outH, outM] = data.checkOut.split(":").map(Number);
    workHours = Math.max(0, (outH * 60 + outM - (inH * 60 + inM)) / 60);
  }

  const record = await Attendance.create({
    ...data,
    date,
    workHours: data.workHours ?? workHours,
    recordedBy: userId,
  });
  return await record.populate(populate);
};

export const getAttendanceByStaff = async (staffId, filters = {}) => {
  const query = { staff: staffId };
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  } else if (filters.month && filters.year) {
    const start = new Date(filters.year, filters.month - 1, 1);
    const end   = new Date(filters.year, filters.month,     0, 23, 59, 59);
    query.date  = { $gte: start, $lte: end };
  }
  return await Attendance.find(query).populate(populate).sort({ date: -1 });
};

export const getAttendanceByDate = async (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const next = new Date(d); next.setDate(next.getDate() + 1);
  return await Attendance.find({ date: { $gte: d, $lt: next } })
    .populate(populate)
    .sort({ "staff.firstName": 1 });
};

export const getAllAttendance = async (filters = {}) => {
  const query = {};
  if (filters.startDate && filters.endDate) {
    query.date = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
  }
  if (filters.status) query.status = filters.status;
  return await Attendance.find(query).populate(populate).sort({ date: -1 });
};

export const updateAttendance = async (id, data, userId) => {
  const rec = await Attendance.findById(id);
  if (!rec) throw new ApiError(404, "Attendance record not found");

  if (data.checkIn && data.checkOut) {
    const [inH, inM]   = data.checkIn.split(":").map(Number);
    const [outH, outM] = data.checkOut.split(":").map(Number);
    data.workHours = Math.max(0, (outH * 60 + outM - (inH * 60 + inM)) / 60);
  }

  return await Attendance.findByIdAndUpdate(
    id,
    { ...data, recordedBy: userId },
    { new: true, runValidators: true }
  ).populate(populate);
};

export const getOrCreateStaffForUser = async (user) => {
  let staff = await Staff.findOne({ $or: [{ user: user._id }, { email: user.email }] });
  if (!staff) {
    const roleDeptMap = {
      Doctor: "Medical",
      Nurse: "Nursing",
      Receptionist: "Reception",
      "Laboratory Staff": "Laboratory",
      Pharmacist: "Pharmacy",
      Accountant: "Finance",
      Administrator: "Administration",
    };
    const department = roleDeptMap[user.role] || "Other";
    const nameParts = (user.fullName || "User").trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "Staff";

    staff = await Staff.create({
      user: user._id,
      firstName,
      lastName,
      email: user.email,
      role: user.role || "Other",
      department,
      designation: user.role || "Staff Member",
      joinDate: new Date(),
      status: "Active",
    });
  } else if (!staff.user) {
    staff.user = user._id;
    await staff.save();
  }
  return staff;
};

export const getMyAttendanceToday = async (user) => {
  const staff = await getOrCreateStaffForUser(user);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await Attendance.findOne({ staff: staff._id, date: today }).populate(populate);
  return { staff, record };
};

export const checkInSelf = async (user, data = {}) => {
  const staff = await getOrCreateStaffForUser(user);
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const now = new Date();
  const checkInStr = data.checkIn || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const existing = await Attendance.findOne({ staff: staff._id, date });
  if (existing) {
    if (existing.checkIn) {
      throw new ApiError(400, `Already checked in today at ${existing.checkIn}`);
    }
    existing.checkIn = checkInStr;
    existing.status = data.status || (now.getHours() >= 9 && now.getMinutes() > 30 ? "Late" : "Present");
    if (data.notes) existing.notes = data.notes;
    await existing.save();
    return await existing.populate(populate);
  }

  const status = data.status || (now.getHours() >= 9 && now.getMinutes() > 30 ? "Late" : "Present");
  const record = await Attendance.create({
    staff: staff._id,
    date,
    checkIn: checkInStr,
    status,
    notes: data.notes || "Self check-in",
    recordedBy: user._id,
  });
  return await record.populate(populate);
};

export const checkOutSelf = async (user, data = {}) => {
  const staff = await getOrCreateStaffForUser(user);
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({ staff: staff._id, date });
  if (!existing) {
    throw new ApiError(400, "You must check in before checking out");
  }

  const now = new Date();
  const checkOutStr = data.checkOut || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  existing.checkOut = checkOutStr;

  if (existing.checkIn && existing.checkOut) {
    const [inH, inM]   = existing.checkIn.split(":").map(Number);
    const [outH, outM] = existing.checkOut.split(":").map(Number);
    existing.workHours = Math.max(0, Math.round(((outH * 60 + outM - (inH * 60 + inM)) / 60) * 10) / 10);
  }
  if (data.notes) existing.notes = data.notes;

  await existing.save();
  return await existing.populate(populate);
};

export const getAttendanceSummary = async (staffId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month,     0, 23, 59, 59);

  const records = await Attendance.find({
    staff: staffId,
    date:  { $gte: start, $lte: end },
  });

  const summary = { Present: 0, Absent: 0, Late: 0, "Half Day": 0, "On Leave": 0, totalHours: 0 };
  records.forEach((r) => {
    summary[r.status] = (summary[r.status] || 0) + 1;
    summary.totalHours += r.workHours || 0;
  });
  summary.totalDays   = records.length;
  summary.totalHours  = Math.round(summary.totalHours * 10) / 10;
  return summary;
};

export const getMyAttendanceHistory = async (user, filters = {}) => {
  const staff = await getOrCreateStaffForUser(user);
  return await getAttendanceByStaff(staff._id, filters);
};

export const getMyAttendanceSummary = async (user, month, year) => {
  const staff = await getOrCreateStaffForUser(user);
  const summary = await getAttendanceSummary(staff._id, month, year);
  return { staff, summary };
};
