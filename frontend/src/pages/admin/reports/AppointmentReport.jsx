import { useState, useEffect, useCallback } from "react";
import { getAppointmentReportRequest } from "../../../services/reportsService.js";
import ReportPage, { StatCard, BreakdownTable, MonthlyChart } from "./ReportPage.jsx";

const STATUS_COLORS = {
  Scheduled: "bg-yellow-100 text-yellow-700", Completed: "bg-green-100 text-green-700",
  Cancelled:  "bg-red-100 text-red-700",      "No Show": "bg-gray-100 text-gray-500",
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function AppointmentReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [startDate, setStart] = useState("");
  const [endDate,   setEnd]   = useState("");

  const load = useCallback(async (s = startDate, e = endDate) => {
    setLoading(true); setError("");
    try { const d = await getAppointmentReportRequest({ startDate: s, endDate: e }); setReport(d.report); }
    catch(err) { setError(err.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load("", ""); }, []);

  return (
    <ReportPage
      title="Appointment Report" subtitle="Booking status, departments & completion rates"
      icon="📅" accent="#0ea5e9"
      startDate={startDate} endDate={endDate}
      onStartDate={setStart} onEndDate={setEnd}
      onApply={() => load(startDate, endDate)}
      onReset={() => { setStart(""); setEnd(""); load("", ""); }}
      loading={loading} error={error}
    >
      {report && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total"       value={report.total}                          icon="📋" color="sky" />
            <StatCard label="Completed"   value={report.byStatus?.Completed   || 0}     icon="✅" color="green" />
            <StatCard label="Scheduled"   value={report.byStatus?.Scheduled   || 0}     icon="⏳" color="amber" />
            <StatCard label="Completion %" value={`${report.completionRate}%`}           icon="📈" color="indigo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MonthlyChart title="Monthly Appointments" data={report.monthly} field="count" accent="#0ea5e9" />
            <BreakdownTable title="By Status"     data={report.byStatus}     accent="#0ea5e9" />
            <BreakdownTable title="By Department" data={report.byDepartment} accent="#0ea5e9" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Appointments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["ID","Patient","Doctor","Department","Date","Status"].map(h =>
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report.recent || []).map(a => (
                    <tr key={a._id} className="hover:bg-sky-50/20">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">{a.appointmentId}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{a.patient?.firstName} {a.patient?.lastName}</td>
                      <td className="px-5 py-3 text-gray-600">Dr. {a.doctor?.firstName} {a.doctor?.lastName}</td>
                      <td className="px-5 py-3 text-gray-500">{a.department}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{fmt(a.appointmentDate)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>{a.status}</span>
                      </td>
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
