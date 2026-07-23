import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { getAllPatientsRequest } from "../../services/patientService.js";
import { getAllAppointmentsRequest } from "../../services/appointmentService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

function StatCard({ label, value, sub, icon, accent, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex items-start gap-4 card-hover">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${accent}99, ${accent})` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-900 leading-none">
          {loading ? <span className="text-gray-300 animate-pulse">—</span> : value}
        </p>
        <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, desc, accent }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all card-hover"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform"
        style={{ background: `linear-gradient(135deg, ${accent}99, ${accent})` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
      </div>
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-blue-400 ml-auto flex-shrink-0 transition-colors">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      </svg>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [totalPatients, setTotalPatients]   = useState(0);
  const [totalAppts, setTotalAppts]         = useState(0);
  const [todayAppts, setTodayAppts]         = useState(0);
  const [pendingAppts, setPendingAppts]     = useState(0);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pData, aData] = await Promise.all([
          getAllPatientsRequest(),
          getAllAppointmentsRequest(),
        ]);

        const patients = pData.patients || [];
        const appts    = aData.appointments || [];
        const today    = new Date().toDateString();

        setTotalPatients(patients.length);
        setTotalAppts(appts.length);
        setTodayAppts(appts.filter((a) => new Date(a.appointmentDate).toDateString() === today).length);
        setPendingAppts(appts.filter((a) => a.status === "Scheduled").length);
        setRecentPatients(patients.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              System Online
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Patients"      value={totalPatients}  sub="All registered patients"     icon="👥" accent="#3b82f6" loading={loading} />
            <StatCard label="Today's Appointments" value={todayAppts}    sub="Scheduled for today"          icon="📅" accent="#0ea5e9" loading={loading} />
            <StatCard label="Scheduled"            value={pendingAppts}  sub="Awaiting confirmation"        icon="⏳" accent="#f59e0b" loading={loading} />
            <StatCard label="Total Appointments"   value={totalAppts}    sub="All time"                     icon="📋" accent="#8b5cf6" loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Quick Actions */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h2>
              <QuickAction to="/receptionist/patients/new"      icon="➕" title="Register Patient"   desc="Add a new patient record"         accent="#3b82f6" />
              <QuickAction to="/receptionist/patients"          icon="👥" title="View Patients"      desc="Browse all patient records"        accent="#0ea5e9" />
              <QuickAction to="/receptionist/appointments/book" icon="📅" title="Book Appointment"  desc="Schedule a patient appointment"    accent="#10b981" />
              <QuickAction to="/receptionist/appointments"      icon="📋" title="All Appointments"  desc="View and manage appointments"      accent="#8b5cf6" />
            </div>

            {/* Recent patients */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Patients</h2>
                <Link to="/receptionist/patients" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  View all →
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded-full w-32" />
                        <div className="h-2.5 bg-gray-100 rounded-full w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-sm text-gray-400">No patients registered yet</p>
                  <Link to="/receptionist/patients/new" className="mt-3 inline-block text-xs font-bold text-blue-600 hover:text-blue-700">
                    Register first patient →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentPatients.map((p) => {
                    const initials = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
                    return (
                      <Link
                        key={p._id}
                        to={`/receptionist/patients/${p._id}`}
                        className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{p.patientId} · {p.phone}</p>
                        </div>
                        <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
