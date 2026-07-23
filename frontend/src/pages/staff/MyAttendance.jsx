import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";
import api from "../../services/api.js";

const STATUS_COLORS = {
  Present:    "bg-green-100 text-green-700 border-green-200",
  Late:       "bg-orange-100 text-orange-700 border-orange-200",
  "Half Day": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Absent:     "bg-red-100 text-red-700 border-red-200",
  "On Leave": "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_BG = {
  Present:    "from-green-500 to-green-600",
  Late:       "from-orange-500 to-orange-600",
  "Half Day": "from-yellow-500 to-yellow-600",
  Absent:     "from-red-500 to-red-600",
  "On Leave": "from-blue-500 to-blue-600",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function StatPill({ label, value, color }) {
  return (
    <div className={`flex-1 min-w-[80px] rounded-2xl border p-4 text-center ${color}`}>
      <p className="text-2xl font-black leading-none">{value ?? 0}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">{label}</p>
    </div>
  );
}

export default function MyAttendance() {
  const now     = new Date();
  const [today, setToday]           = useState(null);
  const [staff,  setStaff]          = useState(null);
  const [records, setRecords]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error,   setError]         = useState("");
  const [success, setSuccess]       = useState("");
  const [month,   setMonth]         = useState(now.getMonth() + 1);
  const [year,    setYear]          = useState(now.getFullYear());

  const yearOptions = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

  const loadAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [todayRes, histRes, sumRes] = await Promise.all([
        api.get("/attendance/me/today"),
        api.get(`/attendance/me/history?month=${month}&year=${year}`),
        api.get(`/attendance/me/summary?month=${month}&year=${year}`),
      ]);
      setToday(todayRes.data.record || null);
      setStaff(todayRes.data.staff  || null);
      setRecords(histRes.data.records || []);
      setSummary(sumRes.data.summary  || null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(""), 4000); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  const handleCheckIn = async () => {
    setActionBusy(true);
    try {
      await api.post("/attendance/me/check-in");
      flash("✅ Checked in successfully");
      loadAll();
    } catch (e) {
      flash(e.response?.data?.message || "Check-in failed", true);
    } finally { setActionBusy(false); }
  };

  const handleCheckOut = async () => {
    setActionBusy(true);
    try {
      await api.post("/attendance/me/check-out");
      flash("✅ Checked out successfully");
      loadAll();
    } catch (e) {
      flash(e.response?.data?.message || "Check-out failed", true);
    } finally { setActionBusy(false); }
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const todayStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const checkedIn  = Boolean(today?.checkIn);
  const checkedOut = Boolean(today?.checkOut);

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page header */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Attendance</h1>
            <p className="text-sm text-gray-400 mt-0.5">{todayStr}</p>
          </div>

          {/* Alert banners */}
          {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium">{success}</div>}

          {/* Today's card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
            {/* Coloured top strip based on today's status */}
            <div className={`h-2 w-full bg-gradient-to-r ${
              today?.status ? STATUS_BG[today.status] : "from-blue-500 to-blue-600"
            }`} />
            <div className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* Today's info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Today's Status</p>
                    {today ? (
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${STATUS_COLORS[today.status] || "bg-gray-100 text-gray-700"}`}>
                        <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                        {today.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border bg-gray-100 text-gray-500 border-gray-200">
                        Not recorded yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Check In</p>
                      <p className="text-xl font-black text-gray-900">{today?.checkIn || "—"}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Check Out</p>
                      <p className="text-xl font-black text-gray-900">{today?.checkOut || "—"}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Hours</p>
                      <p className="text-xl font-black text-gray-900">
                        {today?.workHours ? `${today.workHours}h` : "—"}
                      </p>
                    </div>
                  </div>

                  {staff && (
                    <p className="text-xs text-gray-400">
                      {staff.firstName} {staff.lastName} · {staff.staffId} · {staff.department}
                    </p>
                  )}
                </div>

                {/* Check-in / check-out buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                  <button
                    onClick={handleCheckIn}
                    disabled={actionBusy || checkedIn || loading}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      checkedIn
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:-translate-y-0.5"
                    }`}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    {checkedIn ? "Already Checked In" : "Check In Now"}
                  </button>
                  <button
                    onClick={handleCheckOut}
                    disabled={actionBusy || !checkedIn || checkedOut || loading}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      !checkedIn || checkedOut
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:-translate-y-0.5"
                    }`}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.44a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd"/>
                    </svg>
                    {checkedOut ? "Already Checked Out" : "Check Out Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly summary */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 lg:p-8">
            {/* Month/Year picker */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Monthly Summary</h2>
              <div className="flex items-center gap-2">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                  {yearOptions.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex gap-3 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 h-20 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            ) : summary ? (
              <div className="flex flex-wrap gap-3">
                <StatPill label="Present"   value={summary.Present}       color="bg-green-50 text-green-700 border border-green-100" />
                <StatPill label="Absent"    value={summary.Absent}        color="bg-red-50 text-red-700 border border-red-100" />
                <StatPill label="Late"      value={summary.Late}          color="bg-orange-50 text-orange-700 border border-orange-100" />
                <StatPill label="Half Day"  value={summary["Half Day"]}   color="bg-yellow-50 text-yellow-700 border border-yellow-100" />
                <StatPill label="On Leave"  value={summary["On Leave"]}   color="bg-blue-50 text-blue-700 border border-blue-100" />
                <StatPill label="Total Hrs" value={`${summary.totalHours ?? 0}h`} color="bg-indigo-50 text-indigo-700 border border-indigo-100" />
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No data for this period</p>
            )}
          </div>

          {/* History table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                Attendance History — {MONTHS[month - 1]} {year}
              </h2>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse items-center">
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                    <div className="flex-1 h-3 bg-gray-100 rounded" />
                    <div className="w-16 h-6 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-400 font-medium">No records for {MONTHS[month - 1]} {year}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Date","Check In","Check Out","Hours","Status","Notes"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{fmtDate(r.date)}</td>
                        <td className="px-5 py-3.5 text-gray-600 font-mono">{r.checkIn  || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-600 font-mono">{r.checkOut || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-600">{r.workHours ? `${r.workHours}h` : "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs max-w-[180px] truncate">{r.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
