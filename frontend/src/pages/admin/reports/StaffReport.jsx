import { useState, useEffect, useCallback } from "react";
import { getStaffReportRequest } from "../../../services/reportsService.js";
import ReportPage, { StatCard, BreakdownTable } from "./ReportPage.jsx";

const STATUS_COLORS = {
  Active:"bg-green-100 text-green-700", Inactive:"bg-gray-100 text-gray-500",
  Suspended:"bg-red-100 text-red-700",  Resigned:"bg-orange-100 text-orange-700",
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";

export default function StaffReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [startDate, setStart] = useState("");
  const [endDate,   setEnd]   = useState("");

  const load = useCallback(async (s = startDate, e = endDate) => {
    setLoading(true); setError("");
    try { const d = await getStaffReportRequest({ startDate: s, endDate: e }); setReport(d.report); }
    catch(err) { setError(err.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load("",""); }, []);

  return (
    <ReportPage
      title="Staff Report" subtitle="Headcount, roles, attendance & leave summary"
      icon="🏥" accent="#ec4899"
      startDate={startDate} endDate={endDate}
      onStartDate={setStart} onEndDate={setEnd}
      onApply={() => load(startDate, endDate)}
      onReset={() => { setStart(""); setEnd(""); load("",""); }}
      loading={loading} error={error}
    >
      {report && (
        <div className="space-y-5">
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Staff"     value={report.total}                     icon="👥" color="pink"   />
            <StatCard label="Active"          value={report.byStatus?.Active    || 0}  icon="✅" color="green"  />
            <StatCard label="Att. Records"    value={report.attendance?.total   || 0}  icon="📋" color="indigo" sub="In selected period" />
            <StatCard label="Leave Requests"  value={report.leave?.total        || 0}  icon="🌴" color="sky"    sub="In selected period" />
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <BreakdownTable title="By Department"  data={report.byDept}    accent="#ec4899" />
            <BreakdownTable title="By Role"        data={report.byRole}    accent="#ec4899" />
            <BreakdownTable title="By Status"      data={report.byStatus}  accent="#ec4899" />
            <BreakdownTable title="Employment Type" data={report.byEmpType} accent="#ec4899" />
          </div>

          {/* Attendance & Leave summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Attendance Summary</h3>
              {report.attendance?.byStatus && Object.keys(report.attendance.byStatus).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(report.attendance.byStatus).sort((a,b)=>b[1]-a[1]).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm font-medium text-gray-700">{status}</span>
                      <span className="text-sm font-extrabold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-4">No data for selected period</p>}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Leave Summary</h3>
              {report.leave?.byStatus && Object.keys(report.leave.byStatus).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(report.leave.byStatus).sort((a,b)=>b[1]-a[1]).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm font-medium text-gray-700">{status}</span>
                      <span className="text-sm font-extrabold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-4">No data for selected period</p>}
            </div>
          </div>

          {/* Staff list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Staff List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Staff ID","Name","Role","Department","Status","Joined"].map(h=>
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report.recent||[]).map(s=>(
                    <tr key={s._id} className="hover:bg-pink-50/20">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">{s.staffId}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{s.firstName} {s.lastName}</td>
                      <td className="px-5 py-3 text-gray-500">{s.role}</td>
                      <td className="px-5 py-3 text-gray-500">{s.department}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status]||"bg-gray-100 text-gray-500"}`}>{s.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{fmt(s.joinDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ReportPage>
  );
}
