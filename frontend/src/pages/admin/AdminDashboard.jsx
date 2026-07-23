import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAllDoctorsRequest } from "../../services/doctorService.js";
import { getAllMedicinesRequest, getMedicineStatsRequest } from "../../services/medicineService.js";
import { getPrescriptionStatsRequest } from "../../services/prescriptionService.js";
import { getStaffStatsRequest, getLeaveStatsRequest } from "../../services/staffService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

function StatCard({ label, value, sub, icon, accent, loading, alert }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-card p-5 flex items-start gap-4 card-hover ${alert ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-lg flex-shrink-0 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${accent}99, ${accent})` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-none">
          {loading ? <span className="text-gray-200 animate-pulse">—</span> : value}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
      </div>
      {alert && <span className="text-red-400 text-sm mt-1">⚠</span>}
    </div>
  );
}

function ActionCard({ to, icon, title, desc, accent }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all card-hover"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base flex-shrink-0 group-hover:scale-105 transition-transform"
        style={{ background: `linear-gradient(135deg, ${accent}99, ${accent})` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
      </div>
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-blue-400 ml-auto flex-shrink-0 transition-colors">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      </svg>
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const [doctors,    setDoctors]    = useState([]);
  const [medStats,   setMedStats]   = useState(null);
  const [rxStats,    setRxStats]    = useState(null);
  const [staffStats, setStaffStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [docData, medData, rxData, stData, lvData] = await Promise.all([
          getAllDoctorsRequest().catch(() => ({ doctors: [] })),
          getMedicineStatsRequest().catch(() => ({ stats: null })),
          getPrescriptionStatsRequest().catch(() => ({ stats: null })),
          getStaffStatsRequest().catch(() => ({ stats: null })),
          getLeaveStatsRequest().catch(() => ({ stats: null })),
        ]);
        setDoctors(docData.doctors || []);
        setMedStats(medData.stats);
        setRxStats(rxData.stats);
        setStaffStats(stData.stats);
        setLeaveStats(lvData.stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeDocs   = doctors.filter((d) => d.isActive).length;
  const inactiveDocs = doctors.length - activeDocs;

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Administrator Access
            </div>
          </div>

          {/* Alert banner — shown if expired meds or low stock */}
          {!loading && medStats && (medStats.expiredCount > 0 || medStats.lowStockCount > 0) && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
              <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Pharmacy Alert</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {medStats.expiredCount > 0 && `${medStats.expiredCount} expired medicine(s) in inventory. `}
                  {medStats.lowStockCount > 0 && `${medStats.lowStockCount} medicine(s) at or below reorder level.`}
                </p>
              </div>
              <Link to="/admin/pharmacy" className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap">
                View →
              </Link>
            </div>
          )}

          {/* Staff stats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Staff & HR</h2>
              <Link to="/admin/staff" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Staff Directory →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total Staff"     value={staffStats?.total ?? 0}     sub="All departments"       icon="👥" accent="#2563eb" loading={loading} />
              <StatCard label="Active Staff"    value={staffStats?.active ?? 0}    sub="Currently employed"    icon="✅" accent="#16a34a" loading={loading} />
              <StatCard label="Pending Leave"   value={leaveStats?.pending ?? 0}   sub="Requires review"       icon="📅" accent="#eab308" loading={loading} alert={(leaveStats?.pending ?? 0) > 0} />
              <StatCard label="Approved Leave"  value={leaveStats?.approved ?? 0}  sub="Currently on leave"    icon="🏖️" accent="#0284c7" loading={loading} />
            </div>
          </div>

          {/* Doctor stats */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Doctors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Doctors"    value={doctors.length} sub="All registered"        icon="👨‍⚕️" accent="#6366f1" loading={loading} />
              <StatCard label="Active Doctors"   value={activeDocs}     sub="Currently practicing"  icon="✅"   accent="#10b981" loading={loading} />
              <StatCard label="Inactive Doctors" value={inactiveDocs}   sub="On leave / inactive"   icon="⏸️"  accent="#f59e0b" loading={loading} />
            </div>
          </div>

          {/* Pharmacy stats */}
          {medStats && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pharmacy</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Medicines"      value={medStats.totalMedicines}               sub="In inventory"        icon="💊" accent="#3b82f6" loading={loading} />
                <StatCard label="Low Stock"      value={medStats.lowStockCount}                sub="Need restocking"     icon="📉" accent="#f59e0b" loading={loading} alert={medStats.lowStockCount > 0} />
                <StatCard label="Expired"        value={medStats.expiredCount}                 sub="Must be removed"     icon="⚠️" accent="#ef4444" loading={loading} alert={medStats.expiredCount > 0} />
                <StatCard label="Prescriptions"  value={rxStats?.total ?? "—"}                 sub="All time"            icon="📋" accent="#8b5cf6" loading={loading} />
              </div>
            </div>
          )}

          {/* Quick actions + recent doctors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h2>
              <ActionCard to="/admin/staff"           icon="👥"  title="Staff Management"    desc="View all hospital staff"         accent="#2563eb" />
              <ActionCard to="/admin/staff/new"       icon="➕"  title="Register Staff"      desc="Add new staff member"            accent="#0284c7" />
              <ActionCard to="/admin/attendance"      icon="📋"  title="Attendance"          desc="Mark & track attendance"         accent="#16a34a" />
              <ActionCard to="/admin/leave"           icon="📅"  title="Leave Requests"      desc="Approve & review leave"          accent="#eab308" />
              <ActionCard to="/admin/doctors/new"     icon="👨‍⚕️" title="Add Doctor"          desc="Register a new doctor"           accent="#6366f1" />
              <ActionCard to="/admin/doctors"         icon="🩺"  title="Doctor Directory"    desc="View and manage doctors"         accent="#3b82f6" />
              <ActionCard to="/admin/laboratory-tests"icon="🔬"  title="Lab Tests"           desc="Monitor laboratory tests"        accent="#8b5cf6" />
              <ActionCard to="/admin/pharmacy"        icon="💊"  title="Pharmacy Overview"   desc="Inventory, prescriptions, stock" accent="#10b981" />
            </div>

            {/* Doctors list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Doctors</h2>
                <Link to="/admin/doctors" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  View all →
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded-full w-36" />
                        <div className="h-2.5 bg-gray-100 rounded-full w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">👨‍⚕️</div>
                  <p className="text-sm text-gray-400">No doctors registered yet</p>
                  <Link to="/admin/doctors/new" className="mt-3 inline-block text-xs font-bold text-blue-600 hover:text-blue-700">
                    Add first doctor →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {doctors.slice(0, 6).map((d) => {
                    const ini = `${d.firstName?.[0] || ""}${d.lastName?.[0] || ""}`.toUpperCase();
                    return (
                      <div key={d._id} className="flex items-center gap-3 py-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {ini}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">Dr. {d.firstName} {d.lastName}</p>
                          <p className="text-xs text-gray-400 truncate">{d.specialization} · {d.department}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {d.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
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
