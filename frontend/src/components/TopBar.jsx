import { useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const ROLE_ACCENT = {
  Doctor:            "#3b82f6",
  Administrator:     "#6366f1",
  Receptionist:      "#0ea5e9",
  "Laboratory Staff":"#8b5cf6",
  Pharmacist:        "#10b981",
  Nurse:             "#ec4899",
  Accountant:        "#f59e0b",
};

const SEGMENT_LABELS = {
  receptionist: "Receptionist", admin: "Admin", doctor: "Doctor",
  laboratory: "Laboratory",     pharmacist: "Pharmacist",
  dashboard: "Dashboard",       patients: "Patients",
  appointments: "Appointments", "medical-records": "Medical Records",
  "laboratory-tests": "Lab Tests", prescriptions: "Prescriptions",
  medicines: "Medicines",       "expiry-alerts": "Expiry Alerts",
  reports: "Reports",           doctors: "Doctors",
  pharmacy: "Pharmacy",         new: "New", book: "Book",
  profile: "Profile",           edit: "Edit",
};

function buildCrumbs(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [];
  let path = "";
  for (const part of parts) {
    path += `/${part}`;
    const label = /^[0-9a-f]{24}$/i.test(part)
      ? "Detail"
      : SEGMENT_LABELS[part] || part.replace(/-/g, " ");
    crumbs.push({ label, path });
  }
  return crumbs;
}

export default function TopBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const now     = new Date();
  const accent  = ROLE_ACCENT[user?.role] || "#3b82f6";
  const crumbs  = buildCrumbs(location.pathname);
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  return (
    <header className="no-print h-[60px] bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30 flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <nav className="flex items-center gap-1 text-xs" aria-label="Breadcrumb">
          <span className="text-gray-400 font-semibold">HMS</span>
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1">
              <span className="text-gray-200 mx-0.5">/</span>
              {i === crumbs.length - 1 ? (
                <span className="font-bold text-gray-700 capitalize">{c.label}</span>
              ) : (
                <Link to={c.path} className="text-gray-400 hover:text-blue-600 capitalize transition-colors">
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <p className="text-[10.5px] text-gray-400 mt-0.5 hidden sm:block">{dateStr}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Greeting pill */}
        <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: accent }}
          />
          <div>
            <p className="text-xs font-bold text-gray-800 leading-none">
              {greeting}, {user?.fullName?.split(" ")[0]}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{user?.role}</p>
          </div>
        </div>

        {/* Avatar → profile */}
        <Link
          to="/profile"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
          title={user?.fullName}
        >
          {initials}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors flex-shrink-0 border border-red-100"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
