import { useState, useEffect, useCallback } from "react";
import { getRevenueReportRequest } from "../../../services/reportsService.js";
import ReportPage, { StatCard, MonthlyChart } from "./ReportPage.jsx";

const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RevenueReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [startDate, setStart] = useState("");
  const [endDate,   setEnd]   = useState("");

  const load = useCallback(async (s = startDate, e = endDate) => {
    setLoading(true); setError("");
    try { const d = await getRevenueReportRequest({ startDate: s, endDate: e }); setReport(d.report); }
    catch(err) { setError(err.response?.data?.message || "Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load("", ""); }, []);

  return (
    <ReportPage
      title="Revenue Report" subtitle="Pharmacy revenue, lab tests & inventory value"
      icon="💰" accent="#10b981"
      startDate={startDate} endDate={endDate}
      onStartDate={setStart} onEndDate={setEnd}
      onApply={() => load(startDate, endDate)}
      onReset={() => { setStart(""); setEnd(""); load("", ""); }}
      loading={loading} error={error}
    >
      {report && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pharmacy Revenue"  value={fmt(report.totalRevenue)}       icon="💰" color="green" sub="From dispensed prescriptions" />
            <StatCard label="Dispensed Rx"      value={report.dispensedRx}             icon="💊" color="purple" />
            <StatCard label="Lab Tests Done"    value={report.labTestsCompleted}       icon="🔬" color="amber" />
            <StatCard label="Inventory Value"   value={fmt(report.inventoryValue)}     icon="📦" color="indigo" sub="Current stock value" />
          </div>

          {/* Revenue chart */}
          {report.monthly?.length > 0 && (
            <MonthlyChart title="Monthly Revenue (Rs.)" data={report.monthly} field="revenue" accent="#10b981" />
          )}

          {/* Monthly revenue table */}
          {report.monthly?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Monthly Revenue Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Month</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...report.monthly].reverse().map(m => (
                      <tr key={m.month} className="hover:bg-green-50/20">
                        <td className="px-5 py-3 font-medium text-gray-700">{m.month}</td>
                        <td className="px-5 py-3 text-right font-bold text-green-600">{fmt(m.revenue)}</td>
                      </tr>
                    ))}
                    <tr className="bg-green-50 font-extrabold">
                      <td className="px-5 py-3 text-gray-700">Total</td>
                      <td className="px-5 py-3 text-right text-green-700">{fmt(report.totalRevenue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary note */}
          <div className="flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <p>Revenue is calculated from dispensed prescription items using their registered unit prices. Lab test revenue is counted by completed tests. Inventory value reflects current stock × unit price.</p>
          </div>
        </div>
      )}
    </ReportPage>
  );
}
