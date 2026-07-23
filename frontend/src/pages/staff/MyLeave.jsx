import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";
import api from "../../services/api.js";

const LEAVE_TYPES = ["Annual","Sick","Maternity","Paternity","Emergency","Unpaid","Other"];

const STATUS_COLORS = {
  Pending:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  Approved:  "bg-green-100 text-green-700 border-green-200",
  Rejected:  "bg-red-100 text-red-700 border-red-200",
  Cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const TYPE_ICONS = {
  Annual:"🌴", Sick:"🤒", Maternity:"👶", Paternity:"👨‍👶",
  Emergency:"🚨", Unpaid:"💸", Other:"📋",
};

const EMPTY_FORM = { leaveType:"Annual", startDate:"", endDate:"", reason:"" };

function StatCard({ label, value, color }) {
  return (
    <div className={`flex-1 min-w-[80px] rounded-2xl border p-4 text-center ${color}`}>
      <p className="text-2xl font-black leading-none">{value ?? 0}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">{label}</p>
    </div>
  );
}

export default function MyLeave() {
  const [leaves,    setLeaves]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [submitting,setSub]       = useState(false);
  const [cancelling,setCancel]    = useState(null);
  const [filter,    setFilter]    = useState("All");
  const [expanded,  setExpanded]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/leave/me");
      setLeaves(data.leaves || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg, isErr = false) => {
    if (isErr) { setError(msg);   setTimeout(() => setError(""),   4000); }
    else       { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  const totalDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diff / 86400000) + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      flash("Please select both start and end dates", true); return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      flash("End date must be on or after start date", true); return;
    }
    setSub(true); setError("");
    try {
      await api.post("/leave/me", form);
      flash("✅ Leave request submitted successfully");
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      load();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to submit leave request", true);
    } finally {
      setSub(false);
    }
  };

  const handleCancel = async (id) => {
    setCancel(id);
    try {
      await api.put(`/leave/me/${id}/cancel`);
      flash("Leave request cancelled");
      load();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to cancel leave", true);
    } finally {
      setCancel(null);
    }
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const filtered = filter === "All" ? leaves : leaves.filter((l) => l.status === filter);

  const stats = {
    total:     leaves.length,
    pending:   leaves.filter((l) => l.status === "Pending").length,
    approved:  leaves.filter((l) => l.status === "Approved").length,
    rejected:  leaves.filter((l) => l.status === "Rejected").length,
    cancelled: leaves.filter((l) => l.status === "Cancelled").length,
    totalDaysApproved: leaves
      .filter((l) => l.status === "Approved")
      .reduce((sum, l) => sum + (l.totalDays || 0), 0),
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Leave Requests</h1>
              <p className="text-sm text-gray-400 mt-0.5">Submit and track your leave applications</p>
            </div>
            <button
              onClick={() => { setShowForm((v) => !v); setError(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 ${
                showForm
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {showForm ? "✕ Close" : "+ Request Leave"}
            </button>
          </div>

          {/* Alert banners */}
          {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium">{success}</div>}

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <StatCard label="Total"           value={stats.total}              color="bg-white border-gray-100 text-gray-700" />
            <StatCard label="Pending"         value={stats.pending}            color="bg-yellow-50 border-yellow-100 text-yellow-700" />
            <StatCard label="Approved"        value={stats.approved}           color="bg-green-50 border-green-100 text-green-700" />
            <StatCard label="Rejected"        value={stats.rejected}           color="bg-red-50 border-red-100 text-red-700" />
            <StatCard label="Days Approved"   value={stats.totalDaysApproved}  color="bg-blue-50 border-blue-100 text-blue-700" />
          </div>

          {/* New request form */}
          {showForm && (
            <div className="bg-white rounded-3xl border border-blue-200 shadow-card p-6 lg:p-8">
              <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📋</span>
                New Leave Request
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                  <div>
                    <label className={labelCls}>Leave Type <span className="text-red-500">*</span></label>
                    <select
                      value={form.leaveType}
                      onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}
                      className={inputCls}
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Start Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>End Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelCls}>Reason <span className="text-red-500">*</span></label>
                    <textarea
                      value={form.reason}
                      onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                      required
                      rows={3}
                      placeholder="Briefly explain the reason for your leave..."
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Duration preview */}
                {form.startDate && form.endDate && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl w-fit">
                    <span className="text-blue-500 text-sm">📅</span>
                    <p className="text-sm font-semibold text-blue-700">
                      Duration: <span className="font-black">{totalDays(form.startDate, form.endDate)} day(s)</span>
                      {" "}— {fmt(form.startDate)} to {fmt(form.endDate)}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {["All","Pending","Approved","Rejected","Cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filter === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {s}
                {s !== "All" && (
                  <span className="ml-1.5 opacity-70">
                    {leaves.filter((l) => l.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Leave list */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-48" />
                    <div className="h-2.5 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="w-20 h-6 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-12 text-center">
              <div className="text-5xl mb-3">🌴</div>
              <p className="text-gray-500 font-semibold">No {filter !== "All" ? filter.toLowerCase() : ""} leave requests found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Submit your first leave request →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((l) => (
                <div
                  key={l._id}
                  className={`bg-white rounded-2xl border shadow-card overflow-hidden transition-all ${
                    expanded === l._id ? "border-blue-200" : "border-gray-100"
                  }`}
                >
                  {/* Status accent line */}
                  <div className={`h-1 w-full ${
                    l.status === "Approved"  ? "bg-green-400"  :
                    l.status === "Pending"   ? "bg-yellow-400" :
                    l.status === "Rejected"  ? "bg-red-400"    :
                    "bg-gray-200"
                  }`} />

                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpanded(expanded === l._id ? null : l._id)}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Left */}
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                          {TYPE_ICONS[l.leaveType] || "📋"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900">{l.leaveType} Leave</p>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[l.status]}`}>
                              {l.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {fmt(l.startDate)} → {fmt(l.endDate)}
                            <span className="font-semibold text-gray-700 ml-2">· {l.totalDays} day(s)</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">Ref: {l.leaveId}</p>
                        </div>
                      </div>

                      {/* Right — actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {l.status === "Pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(l._id); }}
                            disabled={cancelling === l._id}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-60"
                          >
                            {cancelling === l._id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                        <span className="text-gray-400 text-sm">{expanded === l._id ? "▲" : "▼"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === l._id && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Reason</p>
                          <p className="text-gray-700 leading-relaxed">{l.reason}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Submitted</p>
                          <p className="text-gray-700">
                            {new Date(l.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </p>
                        </div>
                        {l.reviewedBy && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Reviewed By</p>
                            <p className="text-gray-700">{l.reviewedBy?.fullName}</p>
                          </div>
                        )}
                        {l.reviewNotes && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Review Notes</p>
                            <p className="text-gray-700 italic">"{l.reviewNotes}"</p>
                          </div>
                        )}
                      </div>

                      {l.status === "Approved" && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl w-fit">
                          <span className="text-green-500">✅</span>
                          <p className="text-sm font-semibold text-green-700">
                            Approved — attendance auto-marked "On Leave" for all {l.totalDays} day(s)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
