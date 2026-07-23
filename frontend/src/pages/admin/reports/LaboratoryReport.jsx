import { useState, useEffect, useCallback } from "react";
import { getLaboratoryReportRequest } from "../../../services/reportsService.js";
import ReportPage, { StatCard, BreakdownTable, MonthlyChart } from "./ReportPage.jsx";

const STATUS_COLORS = {
  Pending:"bg-yellow-100 text-yellow-700", Completed:"bg-green-100 text-green-700",
  "In Progress":"bg-blue-100 text-blue-700", Cancelled:"bg-red-100 text-red-700",
  "Sample Collected":"bg-purple-100 text-purple-700",
};
const PRIORITY_COLORS = {
  Routine:"bg-gray-100 text-gray-600", Urgent:"bg-orange-100 text-orange-700", Emergency:"bg-red-100 text-red-700",
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function LaboratoryReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [startDate, setStart] = useState("");
  const [endDate,   setEnd]   = useState("");

  const load = useCallback(async (s = startDate, e = endDate) => {
    setLoading(true); setError("");
    try { const d = await getLaboratoryReportRequest({ startDate: s, endDate: e }); setReport(d.report); }
    catch(err) { setError(err.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load("", ""); }, []);

  return (
    <ReportPage
      title="Laboratory Report" subtitle="Test requests, types, priorities & completion"
      icon="🔬" accent="#f59e0b"
      startDate={startDate} endDate={endDate}
      onStartDate={setStart} onEndDate={setEnd}
      onApply={() => load(startDate, endDate)}
      onReset={() => { setStart(""); setEnd(""); load("", ""); }}
      loading={loading} error={error}
    >
      {report && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Tests"     value={report.total}                    icon="🔬" color="amber"  />
            <StatCard label="Completed"       value={report.byStatus?.Completed  || 0} icon="✅" color="green"  />
            <StatCard label="Pending"         value={report.byStatus?.Pending    || 0} icon="⏳" color="indigo" />
            <StatCard label="Completion Rate" value={`${report.completionRate}%`}      icon="📈" color="sky"    />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MonthlyChart title="Monthly Lab Tests" data={report.monthly} field="count" accent="#f59e0b" />
            <BreakdownTable title="By Status"   data={report.byStatus}   accent="#f59e0b" />
            <BreakdownTable title="By Test Type" data={report.byType}    accent="#f59e0b" />
          </div>

          <BreakdownTable title="By Priority" data={report.byPriority} accent="#f59e0b" />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Lab Tests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Test ID","Patient","Test Name","Type","Priority","Date","Status"].map(h =>
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report.recent || []).map(t => (
                    <tr key={t._id} className="hover:bg-amber-50/20">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">{t.testId}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{t.patient?.firstName} {t.patient?.lastName}</td>
                      <td className="px-5 py-3 text-gray-600">{t.testName}</td>
                      <td className="px-5 py-3 text-gray-500">{t.testType}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_COLORS[t.priority] || "bg-gray-100 text-gray-500"}`}>{t.priority}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{fmt(t.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-500"}`}>{t.status}</span>
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
