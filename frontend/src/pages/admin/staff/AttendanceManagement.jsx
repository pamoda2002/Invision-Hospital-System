import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllStaffRequest,
  getAllAttendanceRequest,
  markAttendanceRequest,
  updateAttendanceRequest,
} from "../../../services/staffService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const STATUSES = ["Present","Absent","Late","Half Day","On Leave"];
const STATUS_COLORS = {
  Present:"bg-green-100 text-green-700",   Absent:"bg-red-100 text-red-700",
  Late:"bg-orange-100 text-orange-700",    "Half Day":"bg-yellow-100 text-yellow-700",
  "On Leave":"bg-blue-100 text-blue-700",
};

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_MARK = { staff:"", date: today(), checkIn:"09:00", checkOut:"17:00", status:"Present", notes:"" };

export default function AttendanceManagement() {
  const navigate = useNavigate();
  const [records,  setRecords]  = useState([]);
  const [staff,    setStaff]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editRec,  setEditRec]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_MARK);
  const [submitting, setSub]    = useState(false);
  const [filterDate, setFDate]  = useState(today());
  const [filterStatus, setFStatus] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterDate)   filters.startDate = filters.endDate = filterDate;
      if (filterStatus) filters.status    = filterStatus;
      const [rData, sData] = await Promise.all([
        getAllAttendanceRequest(filters),
        getAllStaffRequest({ status: "Active" }),
      ]);
      setRecords(rData.records);
      setStaff(sData.staff);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [filterDate, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSub(true); setError("");
    try {
      if (editRec) {
        await updateAttendanceRequest(editRec._id, form);
      } else {
        await markAttendanceRequest(form);
      }
      setShowForm(false); setEditRec(null); setForm(EMPTY_MARK);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSub(false);
    }
  };

  const openEdit = (rec) => {
    setEditRec(rec);
    setForm({
      staff: rec.staff._id, date: rec.date.split("T")[0],
      checkIn: rec.checkIn || "", checkOut: rec.checkOut || "",
      status: rec.status, notes: rec.notes || "",
    });
    setShowForm(true);
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">Track and manage staff attendance records</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/admin/staff")}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ← Staff List
              </button>
              <button onClick={() => { setShowForm(true); setEditRec(null); setForm(EMPTY_MARK); }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                + Mark Attendance
              </button>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${STATUS_COLORS[s]}`}>
                <span>{s}</span>
                <span className="bg-white/60 px-1.5 py-0.5 rounded-lg">{statusCounts[s] || 0}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date</label>
              <input type="date" value={filterDate} onChange={(e) => setFDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</label>
              <select value={filterStatus} onChange={(e) => setFStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

          {/* Mark / Edit form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-blue-200 shadow-card p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-5">{editRec ? "Edit Attendance Record" : "Mark Attendance"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Staff Member <span className="text-red-500">*</span></label>
                    <select value={form.staff} onChange={(e) => setForm((p) => ({...p, staff:e.target.value}))}
                      required disabled={!!editRec} className={inputCls}>
                      <option value="">Select staff</option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.firstName} {s.lastName} — {s.department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.date} onChange={(e) => setForm((p) => ({...p, date:e.target.value}))}
                      required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                    <select value={form.status} onChange={(e) => setForm((p) => ({...p, status:e.target.value}))}
                      required className={inputCls}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Check In</label>
                    <input type="time" value={form.checkIn} onChange={(e) => setForm((p) => ({...p, checkIn:e.target.value}))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Check Out</label>
                    <input type="time" value={form.checkOut} onChange={(e) => setForm((p) => ({...p, checkOut:e.target.value}))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <input value={form.notes} onChange={(e) => setForm((p) => ({...p, notes:e.target.value}))}
                      placeholder="Optional notes" className={inputCls} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button type="button" onClick={() => { setShowForm(false); setEditRec(null); }}
                    className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-60">
                    {submitting ? "Saving..." : editRec ? "Update" : "Mark Attendance"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Records table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-40" />
                    <div className="h-2.5 bg-gray-100 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-400 font-medium">No attendance records found for this filter</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Staff","Department","Date","Check In","Check Out","Hours","Status","Notes","Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {r.staff?.firstName} {r.staff?.lastName}
                          <p className="text-[10px] text-gray-400">{r.staff?.staffId}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.staff?.department}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {new Date(r.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.checkIn || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{r.checkOut || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{r.workHours ? `${r.workHours.toFixed(1)}h` : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[120px] truncate">{r.notes || "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
