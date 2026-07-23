import { useState, useEffect, useCallback } from "react";
import { getPharmacyReportRequest } from "../../../services/reportsService.js";
import ReportPage, { StatCard, BreakdownTable, MonthlyChart } from "./ReportPage.jsx";

const STATUS_COLORS = {
  Pending:"bg-yellow-100 text-yellow-700", Dispensed:"bg-green-100 text-green-700",
  "Partially Dispensed":"bg-blue-100 text-blue-700", Cancelled:"bg-red-100 text-red-700",
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function PharmacyReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [startDate, setStart] = useState("");
  const [endDate,   setEnd]   = useState("");

  const load = useCallback(async (s = startDate, e = endDate) => {
    setLoading(true); setError("");
    try { const d = await getPharmacyReportRequest({ startDate: s, endDate: e }); setReport(d.report); }
    catch(err) { setError(err.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load("", ""); }, []);

  return (
    <ReportPage
      title="Pharmacy Report" subtitle="Medicines, prescriptions, stock & expiry"
      icon="💊" accent="#8b5cf6"
      startDate={startDate} endDate={endDate}
      onStartDate={setStart} onEndDate={setEnd}
      onApply={() => load(startDate, endDate)}
      onReset={() => { setStart(""); setEnd(""); load("", ""); }}
      loading={loading} error={error}
    >
      {report && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Medicines"        value={report.totalMedicines}        icon="💊" color="purple" />
            <StatCard label="Low Stock"        value={report.lowStock}              icon="📉" color="amber"  sub="At or below reorder level" />
            <StatCard label="Expired"          value={report.expired}               icon="⚠️" color="red"    sub="Must be removed" />
            <StatCard label="Total Rx"         value={report.totalPrescriptions}    icon="📋" color="indigo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MonthlyChart title="Monthly Prescriptions" data={report.monthly} field="count" accent="#8b5cf6" />
            <BreakdownTable title="Prescriptions by Status" data={report.rxByStatus} accent="#8b5cf6" />
            <BreakdownTable title="Medicines by Category"   data={report.byCategory?.map(c => ({ label: c._id, value: c.count }))} accent="#8b5cf6" />
          </div>

          {/* Top dispensed medicines */}
          {report.topMedicines?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Top Dispensed Medicines</h3>
              <div className="space-y-2">
                {report.topMedicines.map((m, i) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 text-xs font-extrabold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">{m._id}</span>
                    <span className="text-sm font-bold text-violet-600">{m.dispensed} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent prescriptions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Recent Prescriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Rx ID","Patient","Doctor","Items","Date","Status"].map(h =>
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(report.recentRx || []).map(rx => (
                    <tr key={rx._id} className="hover:bg-violet-50/20">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">{rx.prescriptionId}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{rx.patient?.firstName} {rx.patient?.lastName}</td>
                      <td className="px-5 py-3 text-gray-600">Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}</td>
                      <td className="px-5 py-3 text-gray-500">{rx.medicines?.length}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{fmt(rx.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[rx.status] || "bg-gray-100 text-gray-600"}`}>{rx.status}</span>
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
