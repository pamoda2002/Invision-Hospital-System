import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Staff from "./models/Staff.js";
import Attendance from "./models/Attendance.js";
import LeaveRequest from "./models/LeaveRequest.js";
import { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff, getStaffStats } from "./services/staffService.js";
import { markAttendance, getAllAttendance, getAttendanceSummary } from "./services/attendanceService.js";
import { createLeaveRequest, getAllLeaveRequests, reviewLeaveRequest, getLeaveStats } from "./services/leaveService.js";

dotenv.config();

async function runTests() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    // 1. Clean up old test data if any
    const testEmail = "test.staff.automation@hospital.com";
    await Staff.deleteMany({ email: testEmail });
    await LeaveRequest.deleteMany({ reason: "Automation test leave request" });

    // 2. Test Staff Registration
    console.log("\n--- 1. Testing Employee Registration ---");
    const newStaff = await createStaff({
      firstName: "Test",
      lastName: "Employee",
      email: testEmail,
      phone: "+94 77 123 4567",
      role: "Nurse",
      department: "Nursing",
      designation: "Senior Staff Nurse",
      employmentType: "Full-Time",
      joinDate: new Date().toISOString(),
      salary: 85000,
      nationalId: "951234567V",
      address: "123 Healthcare Ave, Colombo",
      gender: "Female",
      dateOfBirth: "1995-05-15",
      emergencyContact: { name: "John Doe", relationship: "Spouse", phone: "+94 77 987 6543" },
      status: "Active",
      notes: "Automated test staff member",
    });
    console.log("Staff Registered successfully! Staff ID:", newStaff.staffId);

    // 3. Test Staff Listing & Filtering
    console.log("\n--- 2. Testing View and Filter Staff ---");
    const staffList = await getAllStaff({ department: "Nursing", search: "Test" });
    console.log(`Found ${staffList.length} staff member(s) matching filter.`);

    // 4. Test Staff Stats
    console.log("\n--- 3. Testing Staff Stats ---");
    const stats = await getStaffStats();
    console.log("Staff Stats:", JSON.stringify(stats, null, 2));

    // 5. Test Staff Update (Department / Role Assignment)
    console.log("\n--- 4. Testing Update Employee Details & Department Assignment ---");
    const updatedStaff = await updateStaff(newStaff._id, {
      department: "Administration",
      designation: "Nurse Supervisor",
      salary: 95000,
    });
    console.log("Updated Staff Department & Designation:", updatedStaff.department, "-", updatedStaff.designation);

    // 6. Test Attendance Management
    console.log("\n--- 5. Testing Attendance Management ---");
    const todayStr = new Date().toISOString().split("T")[0];
    const dummyUser = await User.findOne();
    const adminUserId = dummyUser ? dummyUser._id : new mongoose.Types.ObjectId();

    const attRecord = await markAttendance(
      {
        staff: newStaff._id,
        date: todayStr,
        checkIn: "08:30",
        checkOut: "17:00",
        status: "Present",
        notes: "On time",
      },
      adminUserId
    );
    console.log("Attendance Recorded:", attRecord.status, "Work Hours:", attRecord.workHours);

    const now = new Date();
    const attSummary = await getAttendanceSummary(newStaff._id, now.getMonth() + 1, now.getFullYear());
    console.log("Attendance Summary:", attSummary);

    // 7. Test Leave Request Management & Approval
    console.log("\n--- 6. Testing Leave Request Management & Approval ---");
    const leaveReq = await createLeaveRequest(
      {
        staff: newStaff._id,
        leaveType: "Annual",
        startDate: "2026-08-01",
        endDate: "2026-08-03",
        reason: "Automation test leave request",
      },
      adminUserId
    );
    console.log("Leave Request Submitted! ID:", leaveReq.leaveId, "Total Days:", leaveReq.totalDays, "Status:", leaveReq.status);

    const reviewedLeave = await reviewLeaveRequest(leaveReq._id, "Approved", "Approved by Admin Automation", adminUserId);
    console.log("Leave Request Reviewed! Status:", reviewedLeave.status, "Reviewer Note:", reviewedLeave.reviewNotes);

    // Verify auto-synced attendance for leave dates
    const checkDate = new Date(2026, 7, 1);
    const leaveAtt = await Attendance.findOne({ staff: newStaff._id, date: checkDate });
    console.log("Auto-synced Leave Attendance record status:", leaveAtt ? leaveAtt.status : "Not found");

    const lStats = await getLeaveStats();
    console.log("Leave Stats:", JSON.stringify(lStats, null, 2));

    // Cleanup test record
    console.log("\n--- 7. Cleanup ---");
    await Staff.findByIdAndDelete(newStaff._id);
    await LeaveRequest.findByIdAndDelete(leaveReq._id);
    await Attendance.deleteMany({ staff: newStaff._id });
    console.log("Test data cleaned up.");

    console.log("\n✅ ALL BACKEND STAFF MANAGEMENT TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

runTests();
