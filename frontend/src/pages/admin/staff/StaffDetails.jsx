import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getStaffByIdRequest,
  getAttendanceSummaryRequest,
  getLeaveByStaffRequest,
} from "../../../services/staffService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const STATUS_COLORS = {
  Active:"bg-green-100 text-green-700", Inactive:"bg-gray-100 text-gray-600",
  Suspended:"bg-red-100 text-red-700",  Resigned:"bg-orange-100 text-orange-700",
};
const LEAVE_COLORS = {
  Pending:"bg-yellow-100 text-yellow-700", Approved:"bg-green-100 text-green-700",
  Rejected:"bg-red-100 text-red-700",      Cancelled:"bg-gray-100 text-gray-600",
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right">{value || "—"}</span>
    </div>
  );
}

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff,    setStaff]   = useState(null);
  const [summary,  setSummary] = useState(null);
  const [leaves,   setLeaves]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  useEffect(() => {
    const load = async () => {
      try {
        const [sData, aData, lData] = await Promise.all([
          getStaffByIdRequest(id),
          getAttendanceSummaryRequest(id, month, year),
          getLeaveByStaffRequest(id),
        ]);
        setStaff(sData.staff);
        setSummary(aData.summary);
        setLeaves(lData.leaves);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load staff details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}) : "—";
  const initials = staff ? `${staff.firstName?.[0]||""}${staff.lastName?.[0]||""}`.toUpperCase() : "?";

  if (loading) return (
    <div className="flex min-h-screen bg-[#f0f4f8]"><Sidebar />
      <div className="flex-1 flex flex-col"><TopBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse font-medium">Loading...</div>
        </main>
      </div>
    </div>
  );

  if (error || !staff) return (
    <div className="flex min-h-screen bg-[#f0f4f8]"><Sidebar />
      <div className="flex-1 flex flex-col"><TopBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-card">
            <p className="text-red-600 font-medium mb-4">{error || "Staff not found"}</p>
            <button onClick={() => navigate("/admin/staff")} className="text-sm font-bold text-blue-600">← Back to Staff List</button>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-black shadow-lg">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">{staff.firstName} {staff.lastName}</h1>
                <p className="text-sm text-gray-400">{staff.designation || staff.role} · {staff.department}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[staff.status]}`}>{staff.status}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/admin/staff/${id}/edit`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm">
                Edit
              </button>
              <button onClick={() => navigate("/admin/staff")}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                ← Back
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Personal & Employment */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Personal Info</h2>
                <InfoRow label="Staff ID"   value={staff.staffId} />
                <InfoRow label="Email"      value={staff.email} />
                <InfoRow label="Phone"      value={staff.phone} />
                <InfoRow label="Gender"     value={staff.gender} />
                <InfoRow label="Date of Birth" value={fmt(staff.dateOfBirth)} />
                <InfoRow label="National ID" value={staff.nationalId} />
                <InfoRow label="Address"    value={staff.address} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Employment</h2>
                <InfoRow label="Role"        value={staff.role} />
                <InfoRow label="Department"  value={staff.department} />
                <InfoRow label="Designation" value={staff.designation} />
                <InfoRow label="Type"        value={staff.employmentType} />
                <InfoRow label="Join Date"   value={fmt(staff.joinDate)} />
                <InfoRow label="Salary"      value={staff.salary ? `Rs. ${Number(staff.salary).toLocaleString()}` : null} />
              </div>
              {staff.emergencyContact?.name && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Emergency Contact</h2>
                  <InfoRow label="Name"         value={staff.emergencyContact.name} />
                  <InfoRow label="Relationship" value={staff.emergencyContact.relationship} />
                  <InfoRow label="Phone"        value={staff.emergencyContact.phone} />
                </div>
              )}
            </div>

            {/* Right — Attendance & Leave */}
            <div className="lg:col-span-2 space-y-6">

              {/* Attendance summary */}
              {summary && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Attendance — {new Date(year, month-1).toLocaleString("en-US",{month:"long",year:"numeric"})}
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      {label:"Present",   value:summary.Present    ||0, color:"bg-green-50 text-green-700"},
                      {label:"Absent",    value:summary.Absent     ||0, color:"bg-red-50 text-red-700"},
                      {label:"Late",      value:summary.Late       ||0, color:"bg-orange-50 text-orange-700"},
                      {label:"Half Day",  value:summary["Half Day"]||0, color:"bg-yellow-50 text-yellow-700"},
                      {label:"On Leave",  value:summary["On Leave"]||0, color:"bg-blue-50 text-blue-700"},
                      {label:"Hours",     value:summary.totalHours ||0, color:"bg-indigo-50 text-indigo-700"},
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                        <p className="text-2xl font-black">{s.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => navigate(`/admin/staff/${id}/attendance`)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700">
                      View full attendance →
                    </button>
                  </div>
                </div>
              )}

              {/* Leave history */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Leave History</h2>
                  <button onClick={() => navigate(`/admin/leave?staff=${id}`)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    Manage →
                  </button>
                </div>
                {leaves.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No leave requests found</p>
                ) : (
                  <div className="space-y-2">
                    {leaves.slice(0, 5).map((l) => (
                      <div key={l._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{l.leaveType} Leave</p>
                          <p className="text-xs text-gray-400">{fmt(l.startDate)} → {fmt(l.endDate)} · {l.totalDays} day(s)</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${LEAVE_COLORS[l.status]}`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {staff.notes && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Notes</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">{staff.notes}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
