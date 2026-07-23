import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const ROLE_META = {
  Doctor:           { icon: "👨‍⚕️", color: "from-blue-600 to-blue-700",    badge: "bg-blue-100 text-blue-700",    dept: "Medical Staff" },
  Administrator:    { icon: "🛡️",   color: "from-slate-700 to-slate-800",  badge: "bg-slate-100 text-slate-700",  dept: "Administration" },
  Receptionist:     { icon: "🏥",   color: "from-teal-500 to-teal-600",    badge: "bg-teal-100 text-teal-700",    dept: "Front Desk" },
  "Laboratory Staff":{ icon: "🔬",  color: "from-purple-600 to-purple-700",badge: "bg-purple-100 text-purple-700",dept: "Laboratory" },
  Pharmacist:       { icon: "💊",   color: "from-emerald-500 to-emerald-600",badge:"bg-emerald-100 text-emerald-700",dept:"Pharmacy" },
  Nurse:            { icon: "🩺",   color: "from-pink-500 to-pink-600",    badge: "bg-pink-100 text-pink-700",    dept: "Nursing" },
  Accountant:       { icon: "📊",   color: "from-amber-500 to-amber-600",  badge: "bg-amber-100 text-amber-700",  dept: "Finance" },
};

const DEFAULT_META = { icon: "👤", color: "from-gray-500 to-gray-600", badge: "bg-gray-100 text-gray-700", dept: "Staff" };

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-base font-bold text-gray-900 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, authBusy } = useAuth();
  const navigate = useNavigate();
  const meta = ROLE_META[user?.role] || DEFAULT_META;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Hero card */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm">
              {/* Gradient header strip */}
              <div className={`h-32 bg-gradient-to-r ${meta.color} relative`}>
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              </div>

              {/* Avatar + name row */}
              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
                  <div className="flex items-end gap-5">
                    {/* Avatar circle */}
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-3xl font-extrabold text-white shadow-xl ring-4 ring-white flex-shrink-0`}>
                      {initials}
                    </div>
                    <div className="mb-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{user?.fullName}</h1>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.badge}`}>
                          {meta.icon} {user?.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{meta.dept} · Invision Hospital</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                      user?.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${user?.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      {user?.status || "Active"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard label="Full Name"  value={user?.fullName}  icon="👤" />
              <InfoCard label="Username"   value={user?.username}  icon="🪪" />
              <InfoCard label="Email"      value={user?.email}     icon="✉️" />
              <InfoCard label="Role"       value={user?.role}      icon={meta.icon} />
              <InfoCard label="Department" value={meta.dept}       icon="🏥" />
              <InfoCard label="Account Status" value={user?.status || "Active"} icon="🛡️" />
            </div>

            {/* Session & security card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-5">Session & Security</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Session Type",  value: "HttpOnly Cookie",   icon: "🔒" },
                  { label: "JWT Storage",   value: "Not in localStorage", icon: "🚫" },
                  { label: "Member Since",  value: joinedDate,           icon: "📅" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-700">Sign out of your account</p>
                <p className="text-xs text-gray-400 mt-0.5">You will be redirected to the login page.</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={authBusy}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.97] disabled:opacity-60"
              >
                <span>⎋</span>
                {authBusy ? "Signing out..." : "Sign Out"}
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
