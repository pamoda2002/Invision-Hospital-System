import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAllLeaveRequestsRequest,
  getAllStaffRequest,
  createLeaveRequestRequest,
  reviewLeaveRequestRequest,
  cancelLeaveRequestRequest,
  getLeaveStatsRequest,
} from "../../../services/staffService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const LEAVE_TYPES = ["Annual","Sick","Maternity","Paternity","Emergency","Unpaid","Other"];
const STATUS_COLORS = {
  Pending:"bg-yellow-100 text-yellow-700",  Approved:"bg-green-100 text-green-700",
  Rejected:"bg-red-100 text-red-700",       Cancelled:"bg-gray-100 text-gray-500",
};

const EMPTY_FORM = { staff:"", leaveType:"Annual", startDate:"", endDate:"", reason:"" };

export default function LeaveManagement() {
  const navigate = useNavigate();
  const [params]  = useSearchParams();
  const preStaff  = params.get("staff") || "";

  const [leaves,   setLeaves]   = useState([]);
  const [staff,    setStaff]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  // Filters
  const [fStatus,    setFStatus]    = useState("");
  const [fType,      setFType]      = useState("");
  const [fStaff,     setFStaff]     = useState(preStaff);

  // New leave form
  const [showForm, setShowForm]   = useState(false);
  const [form,     setForm]       = useState({...EMPTY_FORM, staff: preStaff});
  const [submitting, setSub]      = useState(false);

  // Review modal
  const [reviewModal, setReviewModal]   = useState(null);
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [reviewNotes,  setReviewNotes]  = useState("");
  const [reviewing,    setReviewing]    = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (fStatus) filters.status    = fStatus;
      if (fType)   filters.leaveType = fType;
      if (fStaff)  filters.staff     = fStaff;
      const [lData, sData, stData] = await Promise.all([
        getAllLeaveRequestsRequest(filters),
        getAllStaffRequest(),
        getLeaveStatsRequest(),
      ]);
      setLeaves(lData.leaves);
      setStaff(sData.staff);
      setStats(stData.stats);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [fStatus, fType, fStaff]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSub(true); setError("");
    try {
      await createLeaveRequestRequest(form);
      setShowForm(false);
      setForm({...EMPTY_FORM, staff: preStaff});
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSub(false);
    }
  };

  const handleReview = async () => {
    setReviewing(true);
    try {
      await reviewLeaveRequestRequest(reviewModal._id, reviewStatus, reviewNotes);
      setReviewModal(null); setReviewNotes(""); setReviewStatus("Approved");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to review leave request");
    } finally {
      setReviewing(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelLeaveRequestRequest(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel leave");
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Leave Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">Review and approve staff leave requests</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/admin/staff")}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ← Staff List
              </button>
              <button onClick={() => setShowForm(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                + New Request
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                {label:"Total",     value:stats.total,     color:"bg-white text-blue-600"},
                {label:"Pending",   value:stats.pending,   color:"bg-yellow-50 text-yellow-700"},
                {label:"Approved",  value:stats.approved,  color:"bg-green-50 text-green-700"},
                {label:"Rejected",  value:stats.rejected,  color:"bg-red-50 text-red-700"},
                {label:"Cancelled", value:stats.cancelled, color:"bg-gray-50 text-gray-600"},
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border border-gray-100 shadow-card p-4 text-center ${s.color}`}>
                  <p className="text-2xl font-black">{loading ? "—" : s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-wrap gap-3">
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {["Pending","Approved","Rejected","Cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={fType} onChange={(e) => setFType(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={fStaff} onChange={(e) => setFStaff(e.target.value)}
              className="flex-1 min-w-[160px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Staff</option>
              {staff.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

          {/* New Leave Form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-blue-200 shadow-card p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-5">Submit Leave Request</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Staff Member <span className="text-red-500">*</span></label>
                    <select value={form.staff} onChange={(e) => setForm((p) => ({...p, staff:e.target.value}))}
                      required className={inputCls}>
                      <option value="">Select staff</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} — {s.department}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Leave Type <span className="text-red-500">*</span></label>
                    <select value={form.leaveType} onChange={(e) => setForm((p) => ({...p, leaveType:e.target.value}))}
                      className={inputCls}>
                      {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Start Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({...p, startDate:e.target.value}))}
                      required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({...p, endDate:e.target.value}))}
                      required min={form.startDate} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelCls}>Reason <span className="text-red-500">*</span></label>
                    <textarea value={form.reason} onChange={(e) => setForm((p) => ({...p, reason:e.target.value}))}
                      required rows={2} placeholder="Reason for leave..." className={inputCls} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-60">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leave list */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-48" />
                    <div className="h-2.5 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : leaves.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
              <div className="text-4xl mb-2">📅</div>
              <p className="text-gray-400 font-medium">No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((l) => (
                <div key={l._id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                        {l.staff?.firstName?.[0]}{l.staff?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{l.staff?.firstName} {l.staff?.lastName}</p>
                        <p className="text-xs text-gray-400">{l.staff?.department} · {l.leaveId}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">{l.leaveType} Leave</span>
                          <span>·</span>
                          <span>{fmt(l.startDate)} → {fmt(l.endDate)}</span>
                          <span>·</span>
                          <span className="font-semibold">{l.totalDays} day(s)</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Reason: {l.reason}</p>
                        {l.reviewNotes && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">Review note: {l.reviewNotes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[l.status]}`}>{l.status}</span>
                      {l.status === "Pending" && (
                        <>
                          <button onClick={() => { setReviewModal(l); setReviewStatus("Approved"); setReviewNotes(""); }}
                            className="text-xs font-bold text-green-600 hover:text-green-800 px-3 py-1 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                            Review
                          </button>
                          <button onClick={() => handleCancel(l._id)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Review Leave Request</h3>
            <p className="text-sm text-gray-500 mb-5">
              {reviewModal.staff?.firstName} {reviewModal.staff?.lastName} — {reviewModal.leaveType} ({reviewModal.totalDays} days)
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Decision</label>
                <div className="flex gap-3">
                  {["Approved","Rejected"].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewStatus(s)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                        reviewStatus === s
                          ? s === "Approved" ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes (optional)</label>
                <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2} placeholder="Add a note..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setReviewModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReview} disabled={reviewing}
                className={`px-6 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-60 transition-colors ${
                  reviewStatus === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}>
                {reviewing ? "Processing..." : `Confirm ${reviewStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
