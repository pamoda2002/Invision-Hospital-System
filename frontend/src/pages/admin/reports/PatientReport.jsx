import { useState, useEffect, useCallback } from "react";
import { getPatientReportRequest } from "../../../services/reportsService.js";
import ReportPage, { StatCard, BreakdownTable, MonthlyChart } from "./ReportPage.jsx";

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function PatientReport() {
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState("");
  const [startDate, setStart]   = useState("");
  const [endDate,   setEnd]     = useState("");

  const load = useCallback(async (s = startDate, e = endDate) => {
    setLoading(true); setError("");
    try { const d = await getPatientReportRequest({ startDate: s, endDate: e }); setReport(d.report); }
    catch(err) { setError(err.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load("", ""); }, []);

  return (
    <ReportPage
      title="Patient Report" subtitle="Registrations, demographics & monthly trends"
      icon="👥" accent="#3b82f6"
      startDate={startDate} endDate={endDate}
      onStartDate={setStart} onEndDate={setEnd}
      onApply={() => load(startDate, endDate)}
      onReset={() => { setStart(""); setEnd(""); load("", ""); }}
      loading={loading} error={error}
    >
      {report && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Patients"  value={report.total}                          icon="👥" color="blue" />
            <StatCard label="Male"            value={report.byGender?.Male    || 0}          icon="👨" color="sky" />
            <StatCard label="Female"          value={report.byGender?.Female  || 0}          icon="👩" color="pink" />
            <StatCard label="Other"           value={report.byGender?.Other   || 0}          icon="🧑" color="indigo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MonthlyChart title="Monthly Registrations" data={report.monthly} field="count" accent="#3b82f6" />
            <BreakdownTable title="By Gender"      data={report.byGender}     accent="#3b82f6" />
            <BreakdownTable title="By Blood Group" data={report.byBloodGroup} accent="#3b82f6" />
          </div>

          {/* Recent patients */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Registrations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["ID","Name","Gender","Phone","Registered"].map(h =>
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report.recent || []).map(p => (
                    <tr key={p._id} className="hover:bg-blue-50/20">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{p.patientId}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{p.firstName} {p.lastName}</td>
                      <td className="px-5 py-3 text-gray-500">{p.gender}</td>
                      <td className="px-5 py-3 text-gray-500">{p.phone}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{fmt(p.createdAt)}</td>
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
