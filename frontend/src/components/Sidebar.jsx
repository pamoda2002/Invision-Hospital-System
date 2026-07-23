import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/* ── Role accent colours ── */
const ROLE_ACCENT = {
  Doctor:            "#3b82f6",
  Administrator:     "#6366f1",
  Receptionist:      "#0ea5e9",
  "Laboratory Staff":"#8b5cf6",
  Pharmacist:        "#10b981",
  Nurse:             "#ec4899",
  Accountant:        "#f59e0b",
};

/* ── SVG icon set — crisp, single-colour ── */
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-5a1 1 0 011 1v3.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V6a1 1 0 011-1z"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
    </svg>
  ),
  UserPlus: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
    </svg>
  ),
  ClipboardList: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
    </svg>
  ),
  Flask: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L8 5.414V11l-3.293 3.293A1 1 0 005 16v1a1 1 0 001 1h8a1 1 0 001-1v-1a1 1 0 00-.293-.707L12 11V5.414l1.707-1.707A1 1 0 0013 2H7z" clipRule="evenodd"/>
    </svg>
  ),
  Pill: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm-1 4a1 1 0 012 0v4H11a1 1 0 010 2H9a1 1 0 010-2V6z"/>
    </svg>
  ),
  Document: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
    </svg>
  ),
  ChartBar: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
    </svg>
  ),
  Warning: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
    </svg>
  ),
};

function NavSection({ label }) {
  return (
    <p className="mt-5 mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 select-none">
      {label}
    </p>
  );
}

function NavItem({ to, icon: IconComp, label, isActive, badge }) {
  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-white/12 text-white"
          : "text-white/50 hover:bg-white/6 hover:text-white/90"
      }`}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-400" />
      )}
      <span className={`flex-shrink-0 transition-all ${isActive ? "text-blue-300" : "text-white/40 group-hover:text-white/70"}`}>
        <IconComp />
      </span>
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const a = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const accent = ROLE_ACCENT[user?.role] || "#3b82f6";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className="no-print w-[240px] flex-shrink-0 min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #0c1a3a 0%, #0f2051 50%, #0c1a3a 100%)" }}
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
          >
            <span className="text-white font-black text-sm">H</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-extrabold tracking-tight leading-none truncate">Invision HMS</p>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mt-0.5">Hospital System</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3">

        {/* ── RECEPTIONIST ── */}
        {(user?.role === "Receptionist" || user?.role === "Administrator") && (
          <>
            <NavSection label="Overview" />
            <NavItem to="/receptionist/dashboard"         icon={Icon.Dashboard}     label="Dashboard"          isActive={a("/receptionist/dashboard")} />
            <NavSection label="Patients" />
            <NavItem to="/receptionist/patients/new"      icon={Icon.UserPlus}      label="Register Patient"   isActive={a("/receptionist/patients/new")} />
            <NavItem to="/receptionist/patients"          icon={Icon.Users}         label="Patient List"       isActive={a("/receptionist/patients") && !a("/receptionist/patients/new")} />
            <NavSection label="Appointments" />
            <NavItem to="/receptionist/appointments/book" icon={Icon.Calendar}      label="Book Appointment"   isActive={a("/receptionist/appointments/book")} />
            <NavItem to="/receptionist/appointments"      icon={Icon.ClipboardList} label="All Appointments"   isActive={a("/receptionist/appointments") && !a("/receptionist/appointments/book")} />
          </>
        )}

        {/* ── DOCTOR ── */}
        {user?.role === "Doctor" && (
          <>
            <NavSection label="Schedule" />
            <NavItem to="/doctor/appointments"            icon={Icon.Calendar}      label="My Appointments"    isActive={a("/doctor/appointments")} />
            <NavSection label="Clinical" />
            <NavItem to="/doctor/medical-records"         icon={Icon.Document}      label="Medical Records"    isActive={a("/doctor/medical-records")} />
            <NavSection label="Diagnostics" />
            <NavItem to="/doctor/laboratory-tests"        icon={Icon.Flask}         label="Laboratory Tests"   isActive={a("/doctor/laboratory-tests")} />
            <NavSection label="Pharmacy" />
            <NavItem to="/doctor/prescriptions"           icon={Icon.Pill}          label="My Prescriptions"   isActive={a("/doctor/prescriptions")} />
          </>
        )}

        {/* ── ADMINISTRATOR ── */}
        {user?.role === "Administrator" && (
          <>
            <NavSection label="Admin" />
            <NavItem to="/admin/dashboard"                icon={Icon.Dashboard}     label="Dashboard"          isActive={a("/admin/dashboard")} />
            <NavSection label="Staff Management" />
            <NavItem to="/admin/staff"                    icon={Icon.Users}         label="Staff List"         isActive={a("/admin/staff") && !a("/admin/staff/new")} />
            <NavItem to="/admin/staff/new"                icon={Icon.UserPlus}      label="Register Staff / Doctor" isActive={a("/admin/staff/new") || a("/admin/doctors/new")} />
            <NavItem to="/admin/doctors"                  icon={Icon.Users}         label="Doctor Directory"   isActive={a("/admin/doctors") && !a("/admin/doctors/new")} />
            <NavItem to="/admin/attendance"               icon={Icon.ClipboardList} label="Attendance"         isActive={a("/admin/attendance")} />
            <NavItem to="/admin/leave"                    icon={Icon.Calendar}      label="Leave Requests"     isActive={a("/admin/leave")} />
            <NavSection label="Laboratory" />
            <NavItem to="/admin/laboratory-tests"         icon={Icon.Flask}         label="Lab Tests"          isActive={a("/admin/laboratory-tests")} />
            <NavSection label="Pharmacy" />
            <NavItem to="/admin/pharmacy"                 icon={Icon.Pill}          label="Pharmacy Overview"  isActive={a("/admin/pharmacy")} />
            <NavSection label="Reports" />
            <NavItem to="/admin/reports"                  icon={Icon.ChartBar}      label="Reports & Analytics" isActive={a("/admin/reports")} />
          </>
        )}

        {/* ── LABORATORY STAFF ── */}
        {user?.role === "Laboratory Staff" && (
          <>
            <NavSection label="Laboratory" />
            <NavItem to="/laboratory/dashboard"           icon={Icon.Flask}         label="Lab Dashboard"      isActive={a("/laboratory/dashboard")} />
          </>
        )}

        {/* ── PHARMACIST ── */}
        {user?.role === "Pharmacist" && (
          <>
            <NavSection label="Pharmacy" />
            <NavItem to="/pharmacist/medicines"           icon={Icon.Pill}          label="Medicine Inventory" isActive={a("/pharmacist/medicines")} />
            <NavItem to="/pharmacist/prescriptions"       icon={Icon.ClipboardList} label="Prescriptions"      isActive={a("/pharmacist/prescriptions")} />
            <NavItem to="/pharmacist/expiry-alerts"       icon={Icon.Warning}       label="Expiry Alerts"      isActive={a("/pharmacist/expiry-alerts")} />
            <NavItem to="/pharmacist/reports"             icon={Icon.ChartBar}      label="Reports"            isActive={a("/pharmacist/reports")} />
          </>
        )}

        {/* ── MY HR & ATTENDANCE (All Roles) ── */}
        <NavSection label="My HR & Attendance" />
        <NavItem to="/my-attendance"                      icon={Icon.ClipboardList} label="My Attendance"     isActive={a("/my-attendance")} />
        <NavItem to="/my-leave"                           icon={Icon.Calendar}      label="My Leave Requests" isActive={a("/my-leave")} />

        {/* ── ACCOUNT ── */}
        <NavSection label="Account" />
        <NavItem to="/profile"                            icon={Icon.User}          label="My Profile"         isActive={a("/profile")} />
      </nav>

      {/* ── User card at bottom ── */}
      <div className="mx-3 mb-4 mt-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 shadow"
          style={{ background: `linear-gradient(135deg, ${accent}99, ${accent})` }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate leading-none">{user?.fullName}</p>
          <p className="text-white/35 text-[10px] truncate mt-0.5">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-400/10"
        >
          <Icon.Logout />
        </button>
      </div>
    </aside>
  );
}
