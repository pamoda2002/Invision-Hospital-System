import Staff from "../models/Staff.js";
import User  from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { DEFAULT_STAFF_PASSWORD, staffRoleToUserRole } from "../utils/staffAuth.js";

const populateOptions = [
  { path: "user", select: "fullName username email role status" },
];

export const createStaff = async (staffData) => {
  const email = staffData.email.trim().toLowerCase();

  const existing = await Staff.findOne({ email });
  if (existing) throw new ApiError(400, "A staff member with this email already exists");

  // Check if a User account already exists for this email
  let user = await User.findOne({ $or: [{ email }, { username: email }] });

  if (!user) {
    // Create the login account
    user = await User.create({
      fullName: `${staffData.firstName} ${staffData.lastName}`.trim(),
      username: email,
      email,
      password:  DEFAULT_STAFF_PASSWORD,
      role:      staffRoleToUserRole(staffData.role),
      status:    staffData.status === "Inactive" ? "Inactive" : "Active",
    });
  }

  const staff = await Staff.create({ ...staffData, email, user: user._id });
  return await staff.populate(populateOptions);
};

/* Repair staff records that have no linked User account
   (e.g. created while server was in in-memory mode). */
export const repairStaffAccounts = async () => {
  const allStaff = await Staff.find({ user: { $exists: false } })
    .lean();

  const results = [];
  for (const s of allStaff) {
    const email = s.email.trim().toLowerCase();

    let user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (!user) {
      try {
        user = await User.create({
          fullName: `${s.firstName} ${s.lastName}`.trim(),
          username: email,
          email,
          password: DEFAULT_STAFF_PASSWORD,
          role:     staffRoleToUserRole(s.role),
          status:   s.status === "Active" ? "Active" : "Inactive",
        });
        await Staff.findByIdAndUpdate(s._id, { user: user._id });
        results.push({ staffId: s.staffId, email, status: "created" });
      } catch (e) {
        results.push({ staffId: s.staffId, email, status: "error", message: e.message });
      }
    } else {
      await Staff.findByIdAndUpdate(s._id, { user: user._id });
      results.push({ staffId: s.staffId, email, status: "linked" });
    }
  }
  return results;
};

export const getAllStaff = async (filters = {}) => {
  const query = {};
  if (filters.department) query.department = filters.department;
  if (filters.role)       query.role       = filters.role;
  if (filters.status)     query.status     = filters.status;
  if (filters.search) {
    query.$or = [
      { firstName:   { $regex: filters.search, $options: "i" } },
      { lastName:    { $regex: filters.search, $options: "i" } },
      { email:       { $regex: filters.search, $options: "i" } },
      { staffId:     { $regex: filters.search, $options: "i" } },
      { designation: { $regex: filters.search, $options: "i" } },
    ];
  }
  return await Staff.find(query).populate(populateOptions).sort({ createdAt: -1 });
};

export const getStaffById = async (id) => {
  const staff = await Staff.findById(id).populate(populateOptions);
  if (!staff) throw new ApiError(404, "Staff member not found");
  return staff;
};

export const updateStaff = async (id, data) => {
  const staff = await Staff.findById(id);
  if (!staff) throw new ApiError(404, "Staff member not found");

  if (data.email && data.email !== staff.email) {
    const dup = await Staff.findOne({ email: data.email });
    if (dup) throw new ApiError(400, "Email already in use by another staff member");
  }

  // Sync User account status if status changed
  if (data.status && staff.user) {
    await User.findByIdAndUpdate(staff.user, {
      status: data.status === "Active" ? "Active" : "Inactive",
    });
  }

  return await Staff.findByIdAndUpdate(id, data, {
    new: true, runValidators: true,
  }).populate(populateOptions);
};

export const deleteStaff = async (id) => {
  const staff = await Staff.findById(id);
  if (!staff) throw new ApiError(404, "Staff member not found");
  await Staff.findByIdAndUpdate(id, { status: "Inactive" });
  if (staff.user) {
    await User.findByIdAndUpdate(staff.user, { status: "Inactive" });
  }
  return { message: "Staff member deactivated" };
};

export const getStaffStats = async () => {
  const total     = await Staff.countDocuments();
  const active    = await Staff.countDocuments({ status: "Active" });
  const inactive  = await Staff.countDocuments({ status: "Inactive" });
  const suspended = await Staff.countDocuments({ status: "Suspended" });

  const byDept = await Staff.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
  ]);
  const byRole = await Staff.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
  ]);

  return { total, active, inactive, suspended, byDept, byRole };
};
