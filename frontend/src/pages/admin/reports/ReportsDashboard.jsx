import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar  from "../../../components/TopBar.jsx";

const CARDS = [
  {
    key:    "patients",
    title:  "Patient Report",
    desc:   "Registrations, demographics, blood groups & trends",
    icon:   "👥",
    accent: "#3b82f6",
    bg:     "from-blue-500 to-blue-700",
    path:   "/admin/reports/patients",
    stats:  ["Total Patients", "Gender Split", "Blood Groups", "Monthly Trend"],
  },
  {
    key:    "appointments",
    title:  "Appointment Report",
    desc:   "Booking status, departments, completion rates",
    icon:   "📅",
    accent: "#0ea5e9",
    bg:     "from-sky-500 to-sky-700",
    path:   "/admin/reports/appointments",
    stats:  ["Total Appointments", "By Status", "By Department", "Completion Rate"],
  },
  {
    key:    "revenue",
    title:  "Revenue Report",
    desc:   "Pharmacy revenue, lab tests, inventory value",
    icon:   "💰",
    accent: "#10b981",
    bg:     "from-emerald-500 to-emerald-700",
    path:   "/admin/reports/revenue",
    stats:  ["Total Revenue", "Dispensed Rx", "Lab Tests", "Inventory Value"],
  },
  {
    key:    "pharmacy",
    title:  "Pharmacy Report",
    desc:   "Medicines, prescriptions, expiry & stock alerts",
    icon:   "💊",
    accent: "#8b5cf6",
    bg:     "from-violet-500 to-violet-700",
    path:   "/admin/reports/pharmacy",
    stats:  ["Total Medicines", "Low Stock", "Prescriptions", "Top Medicines"],
  },
  {
    key:    "laboratory",
    title:  "Laboratory Report",
    desc:   "Test requests, types, priorities & completion",
    icon:   "🔬",
    accent: "#f59e0b",
    bg:     "from-amber-500 to-amber-700",
    path:   "/admin/reports/laboratory",
    stats:  ["Total Tests", "By Type", "By Priority", "Completion Rate"],
  },
  {
    key:    "staff",
    title:  "Staff Report",
    desc:   "Headcount, roles, departments, attendance & leave",
    icon:   "🏥",
    accent: "#ec4899",
    bg:     "from-pink-500 to-pink-700",
    path:   "/admin/reports/staff",
    stats:  ["Total Staff", "By Department", "Attendance", "Leave"],
  },
];

export default function ReportsDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Administrator</p>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports & Analytics</h1>
              <p className="text-gray-400 mt-1.5 text-sm">
                Generate, filter, export and print all hospital activity reports
              </p>
            </div>

            {/* Quick actions bar */}
            <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-card">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-base">📊</span>
                <span className="font-medium">6 report modules available</span>
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live data from MongoDB Atlas
              </div>
            </div>

            {/* Report cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {CARDS.map((card) => (
                <button
                  key={card.key}
                  onClick={() => navigate(card.path)}
                  className="group bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden text-left"
                >
                  {/* Gradient top bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${card.bg}`} />

                  <div className="p-6">
                    {/* Icon + title */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${card.accent}22, ${card.accent}44)` }}
                      >
                        {card.icon}
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: `${card.accent}18`, color: card.accent }}
                      >
                        View →
                      </span>
                    </div>

                    <h2 className="text-base font-extrabold text-gray-900 mb-1">{card.title}</h2>
                    <p className="text-xs text-gray-400 leading-relaxed mb-5">{card.desc}</p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {card.stats.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{ borderColor: `${card.accent}33`, color: card.accent, background: `${card.accent}0d` }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Filter · Export PDF · Print</span>
                    <svg viewBox="0 0 20 20" fill="currentColor"
                      className="w-4 h-4 text-gray-300 group-hover:-translate-x-0 group-hover:text-gray-500 transition-all"
                      style={{ color: card.accent }}>
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
