import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Login from "../pages/auth/Login.jsx";
import Profile from "../pages/auth/Profile.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { USER_ROLES } from "../utils/roles.js";
import Dashboard from "../pages/receptionist/Dashboard.jsx";
import PatientList from "../pages/receptionist/patients/PatientList.jsx";
import PatientRegistration from "../pages/receptionist/patients/PatientRegistration.jsx";
import PatientDetails from "../pages/receptionist/patients/PatientDetails.jsx";
import EditPatient from "../pages/receptionist/patients/EditPatient.jsx";
import BookAppointment from "../pages/receptionist/appointments/BookAppointment.jsx";
import ViewAppointments from "../pages/receptionist/appointments/ViewAppointments.jsx";
import RescheduleAppointment from "../pages/receptionist/appointments/RescheduleAppointment.jsx";
import DoctorAppointments from "../pages/doctor/Appointments.jsx";
import MedicalRecords from "../pages/doctor/MedicalRecords.jsx";
import AddEditMedicalRecord from "../pages/doctor/AddEditMedicalRecord.jsx";
import ViewMedicalRecord from "../pages/doctor/ViewMedicalRecord.jsx";
import LaboratoryTests from "../pages/doctor/LaboratoryTests.jsx";
import ViewLabTestResult from "../pages/doctor/ViewLabTestResult.jsx";
import CreatePrescription from "../pages/doctor/CreatePrescription.jsx";
import PrescriptionList from "../pages/doctor/PrescriptionList.jsx";import LaboratoryDashboard from "../pages/laboratory/LaboratoryDashboard.jsx";
import EnterTestResults from "../pages/laboratory/EnterTestResults.jsx";
import MedicineInventory from "../pages/pharmacist/MedicineInventory.jsx";
import AddEditMedicine from "../pages/pharmacist/AddEditMedicine.jsx";
import ProcessPrescriptions from "../pages/pharmacist/ProcessPrescriptions.jsx";
import ExpiryAlerts from "../pages/pharmacist/ExpiryAlerts.jsx";
import PharmacyReports from "../pages/pharmacist/PharmacyReports.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import DoctorList from "../pages/admin/doctors/DoctorList.jsx";
import AddDoctor from "../pages/admin/doctors/AddDoctor.jsx";
import EditDoctor from "../pages/admin/doctors/EditDoctor.jsx";
import AdminLaboratoryTests from "../pages/admin/LaboratoryTests.jsx";
import PharmacyOverview from "../pages/admin/PharmacyOverview.jsx";
import ReportsDashboard   from "../pages/admin/reports/ReportsDashboard.jsx";
import PatientReport      from "../pages/admin/reports/PatientReport.jsx";
import AppointmentReport  from "../pages/admin/reports/AppointmentReport.jsx";
import RevenueReport      from "../pages/admin/reports/RevenueReport.jsx";
import PharmacyReport     from "../pages/admin/reports/PharmacyReport.jsx";
import LaboratoryReport   from "../pages/admin/reports/LaboratoryReport.jsx";
import StaffReport        from "../pages/admin/reports/StaffReport.jsx";
import StaffList from "../pages/admin/staff/StaffList.jsx";
import AddEditStaff from "../pages/admin/staff/AddEditStaff.jsx";
import StaffDetails from "../pages/admin/staff/StaffDetails.jsx";
import AttendanceManagement from "../pages/admin/staff/AttendanceManagement.jsx";
import LeaveManagement from "../pages/admin/staff/LeaveManagement.jsx";
import MyAttendance from "../pages/staff/MyAttendance.jsx";
import MyLeave from "../pages/staff/MyLeave.jsx";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Receptionist") return <Navigate to="/receptionist/dashboard" replace />;
  if (user.role === "Administrator") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "Doctor") return <Navigate to="/doctor/appointments" replace />;
  if (user.role === "Laboratory Staff") return <Navigate to="/laboratory/dashboard" replace />;
  if (user.role === "Pharmacist") return <Navigate to="/pharmacist/medicines" replace />;
  return <Navigate to="/profile" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={USER_ROLES}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients/new"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <PatientRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients/:id"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <PatientDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients/:id/edit"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <EditPatient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/appointments"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <ViewAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/appointments/book"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/appointments/:id/reschedule"
        element={
          <ProtectedRoute roles={["Receptionist", "Administrator"]}>
            <RescheduleAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute roles={["Doctor", "Administrator"]}>
            <DoctorAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/medical-records"
        element={
          <ProtectedRoute roles={["Doctor", "Administrator"]}>
            <MedicalRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/medical-records/new"
        element={
          <ProtectedRoute roles={["Doctor", "Administrator"]}>
            <AddEditMedicalRecord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/medical-records/:id"
        element={
          <ProtectedRoute roles={["Doctor", "Administrator"]}>
            <ViewMedicalRecord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/medical-records/:id/edit"
        element={
          <ProtectedRoute roles={["Doctor", "Administrator"]}>
            <AddEditMedicalRecord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/laboratory-tests"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <LaboratoryTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/laboratory-tests/:id"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <ViewLabTestResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/dashboard"
        element={
          <ProtectedRoute roles={["Laboratory Staff", "Administrator"]}>
            <LaboratoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/tests/:id/enter-results"
        element={
          <ProtectedRoute roles={["Laboratory Staff"]}>
            <EnterTestResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/tests/:id"
        element={
          <ProtectedRoute roles={["Laboratory Staff", "Administrator"]}>
            <ViewMedicalRecord />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <DoctorList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors/new"
        element={<Navigate to="/admin/staff/new" replace />}
      />
      <Route
        path="/admin/doctors/:id/edit"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <EditDoctor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/laboratory-tests"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <AdminLaboratoryTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/laboratory-tests/:id"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <ViewMedicalRecord />
          </ProtectedRoute>
        }
      />

      {/* Admin — Staff Management */}
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <StaffList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff/new"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <AddEditStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff/:id"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <StaffDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff/:id/edit"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <AddEditStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <AttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leave"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <LeaveManagement />
          </ProtectedRoute>
        }
      />

      {/* Self-service — all roles */}
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute roles={USER_ROLES}>
            <MyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-leave"
        element={
          <ProtectedRoute roles={USER_ROLES}>
            <MyLeave />
          </ProtectedRoute>
        }
      />

      {/* Doctor — Pharmacy */}
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <PrescriptionList />
          </ProtectedRoute>
        }
      />

      {/* Pharmacist */}
      <Route
        path="/pharmacist/medicines"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <MedicineInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/medicines/new"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <AddEditMedicine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/medicines/:id/edit"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <AddEditMedicine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/prescriptions"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <ProcessPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/prescriptions/all"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <ProcessPrescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/expiry-alerts"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <ExpiryAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacist/reports"
        element={
          <ProtectedRoute roles={["Pharmacist", "Administrator"]}>
            <PharmacyReports />
          </ProtectedRoute>
        }
      />

      {/* Admin — Pharmacy */}
      <Route
        path="/admin/pharmacy"
        element={
          <ProtectedRoute roles={["Administrator"]}>
            <PharmacyOverview />
          </ProtectedRoute>
        }
      />

      {/* Admin — Reports */}
      <Route path="/admin/reports"              element={<ProtectedRoute roles={["Administrator"]}><ReportsDashboard  /></ProtectedRoute>} />
      <Route path="/admin/reports/patients"     element={<ProtectedRoute roles={["Administrator"]}><PatientReport     /></ProtectedRoute>} />
      <Route path="/admin/reports/appointments" element={<ProtectedRoute roles={["Administrator"]}><AppointmentReport /></ProtectedRoute>} />
      <Route path="/admin/reports/revenue"      element={<ProtectedRoute roles={["Administrator"]}><RevenueReport     /></ProtectedRoute>} />
      <Route path="/admin/reports/pharmacy"     element={<ProtectedRoute roles={["Administrator"]}><PharmacyReport    /></ProtectedRoute>} />
      <Route path="/admin/reports/laboratory"   element={<ProtectedRoute roles={["Administrator"]}><LaboratoryReport  /></ProtectedRoute>} />
      <Route path="/admin/reports/staff"        element={<ProtectedRoute roles={["Administrator"]}><StaffReport       /></ProtectedRoute>} />

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
