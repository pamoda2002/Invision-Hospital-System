import Patient      from "../models/Patient.js";
import Appointment  from "../models/Appointment.js";
import Doctor       from "../models/Doctor.js";
import LaboratoryTest from "../models/LaboratoryTest.js";
import Medicine     from "../models/Medicine.js";
import Prescription from "../models/Prescription.js";
import Staff        from "../models/Staff.js";
import Attendance   from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";

/* ─── helpers ─────────────────────────────────────────────────── */
const dateRange = (startDate, endDate) => {
  const q = {};
  if (startDate) q.$gte = new Date(startDate);
  if (endDate)   q.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  return Object.keys(q).length ? q : undefined;
};

const monthlyBuckets = (docs, dateField) => {
  const map = {};
  docs.forEach((d) => {
    const dt = new Date(d[dateField]);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, count]) => ({ month, count }));
};

/* ─── PATIENT REPORT ──────────────────────────────────────────── */
export const getPatientReport = async ({ startDate, endDate } = {}) => {
  const dr = dateRange(startDate, endDate);
  const query = dr ? { createdAt: dr } : {};

  const [total, allPatients] = await Promise.all([
    Patient.countDocuments(query),
    Patient.find(query).select("gender bloodGroup createdAt").lean(),
  ]);

  const byGender = allPatients.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1; return acc;
  }, {});

  const byBloodGroup = allPatients.reduce((acc, p) => {
    acc[p.bloodGroup] = (acc[p.bloodGroup] || 0) + 1; return acc;
  }, {});

  const monthly = monthlyBuckets(allPatients, "createdAt");

  const recent = await Patient.find(query)
    .select("patientId firstName lastName gender phone createdAt")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return { total, byGender, byBloodGroup, monthly, recent };
};

/* ─── APPOINTMENT REPORT ──────────────────────────────────────── */
export const getAppointmentReport = async ({ startDate, endDate } = {}) => {
  const dr = dateRange(startDate, endDate);
  const query = dr ? { appointmentDate: dr } : {};

  const [total, allAppts] = await Promise.all([
    Appointment.countDocuments(query),
    Appointment.find(query).select("status department appointmentDate").lean(),
  ]);

  const byStatus = allAppts.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1; return acc;
  }, {});

  const byDepartment = allAppts.reduce((acc, a) => {
    acc[a.department] = (acc[a.department] || 0) + 1; return acc;
  }, {});

  const monthly = monthlyBuckets(allAppts, "appointmentDate");

  const completionRate = total > 0
    ? Math.round(((byStatus.Completed || 0) / total) * 100)
    : 0;

  const recent = await Appointment.find(query)
    .select("appointmentId patient doctor department appointmentDate appointmentTime status reason")
    .populate("patient", "firstName lastName patientId")
    .populate("doctor",  "firstName lastName specialization")
    .sort({ appointmentDate: -1 })
    .limit(20)
    .lean();

  return { total, byStatus, byDepartment, monthly, completionRate, recent };
};

/* ─── REVENUE REPORT ─────────────────────────────────────────── */
export const getRevenueReport = async ({ startDate, endDate } = {}) => {
  const dr = dateRange(startDate, endDate);

  // Revenue proxy: dispensed prescriptions × avg medicine price
  const presQuery = dr ? { createdAt: dr, status: "Dispensed" } : { status: "Dispensed" };
  const prescriptions = await Prescription.find(presQuery)
    .populate("medicines.medicine", "unitPrice")
    .lean();

  let totalRevenue = 0;
  const monthly = {};

  prescriptions.forEach((rx) => {
    let rxTotal = 0;
    rx.medicines.forEach((item) => {
      const price = item.medicine?.unitPrice || 0;
      rxTotal += price * (item.dispensedQuantity || item.quantity || 0);
    });
    totalRevenue += rxTotal;
    const dt  = new Date(rx.createdAt);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + rxTotal;
  });

  const inventoryValue = await Medicine.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$stockQuantity", "$unitPrice"] } } } },
  ]);

  const labQuery = dr ? { createdAt: dr, status: "Completed" } : { status: "Completed" };
  const labTests = await LaboratoryTest.countDocuments(labQuery);

  const monthlyArr = Object.entries(monthly)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }));

  return {
    totalRevenue:     Math.round(totalRevenue * 100) / 100,
    dispensedRx:      prescriptions.length,
    labTestsCompleted:labTests,
    inventoryValue:   inventoryValue[0]?.total || 0,
    monthly:          monthlyArr,
  };
};

/* ─── PHARMACY REPORT ────────────────────────────────────────── */
export const getPharmacyReport = async ({ startDate, endDate } = {}) => {
  const dr = dateRange(startDate, endDate);

  const [totalMedicines, lowStock, expired, expiring] = await Promise.all([
    Medicine.countDocuments({ isActive: true }),
    Medicine.countDocuments({ isActive: true, $expr: { $lte: ["$stockQuantity", "$reorderLevel"] } }),
    Medicine.countDocuments({ isActive: true, expiryDate: { $lt: new Date() } }),
    Medicine.countDocuments({
      isActive: true,
      expiryDate: { $gte: new Date(), $lte: new Date(Date.now() + 90 * 864e5) },
    }),
  ]);

  const rxQuery = dr ? { createdAt: dr } : {};
  const prescriptions = await Prescription.find(rxQuery)
    .select("status createdAt medicines")
    .lean();

  const rxByStatus = prescriptions.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1; return acc;
  }, {});

  const monthly = monthlyBuckets(prescriptions, "createdAt");

  const topMedicines = await Prescription.aggregate([
    { $unwind: "$medicines" },
    { $group: { _id: "$medicines.medicineName", dispensed: { $sum: "$medicines.dispensedQuantity" } } },
    { $sort: { dispensed: -1 } },
    { $limit: 10 },
  ]);

  const byCategory = await Medicine.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 }, totalStock: { $sum: "$stockQuantity" } } },
    { $sort: { count: -1 } },
  ]);

  const recentRx = await Prescription.find(rxQuery)
    .select("prescriptionId patient doctor status createdAt medicines")
    .populate("patient", "firstName lastName patientId")
    .populate("doctor",  "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    totalMedicines, lowStock, expired, expiring,
    totalPrescriptions: prescriptions.length,
    rxByStatus, monthly, topMedicines, byCategory, recentRx,
  };
};

/* ─── LABORATORY REPORT ──────────────────────────────────────── */
export const getLaboratoryReport = async ({ startDate, endDate } = {}) => {
  const dr = dateRange(startDate, endDate);
  const query = dr ? { createdAt: dr } : {};

  const [total, allTests] = await Promise.all([
    LaboratoryTest.countDocuments(query),
    LaboratoryTest.find(query).select("status testType priority createdAt").lean(),
  ]);

  const byStatus = allTests.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1; return acc;
  }, {});

  const byType = allTests.reduce((acc, t) => {
    acc[t.testType] = (acc[t.testType] || 0) + 1; return acc;
  }, {});

  const byPriority = allTests.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1; return acc;
  }, {});

  const monthly = monthlyBuckets(allTests, "createdAt");

  const completionRate = total > 0
    ? Math.round(((byStatus.Completed || 0) / total) * 100)
    : 0;

  const recent = await LaboratoryTest.find(query)
    .select("testId patient testType testName priority status createdAt")
    .populate("patient", "firstName lastName patientId")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return { total, byStatus, byType, byPriority, monthly, completionRate, recent };
};

/* ─── STAFF REPORT ───────────────────────────────────────────── */
export const getStaffReport = async ({ startDate, endDate } = {}) => {
  const dr = dateRange(startDate, endDate);

  const [total, allStaff] = await Promise.all([
    Staff.countDocuments(),
    Staff.find().select("role department status employmentType joinDate").lean(),
  ]);

  const byRole       = allStaff.reduce((a, s) => { a[s.role]           = (a[s.role]           || 0) + 1; return a; }, {});
  const byDept       = allStaff.reduce((a, s) => { a[s.department]     = (a[s.department]     || 0) + 1; return a; }, {});
  const byStatus     = allStaff.reduce((a, s) => { a[s.status]         = (a[s.status]         || 0) + 1; return a; }, {});
  const byEmpType    = allStaff.reduce((a, s) => { a[s.employmentType] = (a[s.employmentType] || 0) + 1; return a; }, {});

  // Attendance summary for period
  const attQuery = dr ? { date: dr } : {};
  const attDocs  = await Attendance.find(attQuery).select("status").lean();
  const attByStatus = attDocs.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});

  // Leave summary for period
  const lvQuery = dr ? { createdAt: dr } : {};
  const leaveDocs = await LeaveRequest.find(lvQuery).select("status leaveType").lean();
  const leaveByStatus = leaveDocs.reduce((a, l) => { a[l.status] = (a[l.status] || 0) + 1; return a; }, {});
  const leaveByType   = leaveDocs.reduce((a, l) => { a[l.leaveType] = (a[l.leaveType] || 0) + 1; return a; }, {});

  const recent = await Staff.find()
    .select("staffId firstName lastName role department status joinDate")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return {
    total, byRole, byDept, byStatus, byEmpType,
    attendance: { total: attDocs.length, byStatus: attByStatus },
    leave:      { total: leaveDocs.length, byStatus: leaveByStatus, byType: leaveByType },
    recent,
  };
};
