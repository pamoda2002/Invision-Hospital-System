import { useState, useEffect, useRef } from "react";
import {
  getMedicineStatsRequest,
  getLowStockRequest,
  getAllMedicinesRequest,
} from "../../services/medicineService.js";
import { getPrescriptionStatsRequest, getAllPrescriptionsRequest } from "../../services/prescriptionService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";
import { getPrintableHtml, printFormalReport } from "../../utils/printReport.js";

export default function PharmacyReports() {
  const [medicineStats, setMedicineStats] = useState(null);
  const [prescriptionStats, setPrescriptionStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [mStats, pStats, lowStockData, medsData, prescData] = await Promise.all([
          getMedicineStatsRequest(),
          getPrescriptionStatsRequest(),
          getLowStockRequest(),
          getAllMedicinesRequest(),
          getAllPrescriptionsRequest(),
        ]);

        setMedicineStats(mStats.stats);
        setPrescriptionStats(pStats.stats);
        setLowStock(lowStockData.medicines.slice(0, 10));
        setRecentPrescriptions(prescData.prescriptions.slice(0, 10));

        // Build category breakdown
        const cats = {};
        medsData.medicines.forEach((m) => {
          cats[m.category] = cats[m.category] || { count: 0, totalStock: 0, totalValue: 0 };
          cats[m.category].count += 1;
          cats[m.category].totalStock += m.stockQuantity;
          cats[m.category].totalValue += m.stockQuantity * m.unitPrice;
        });
        setCategoryBreakdown(
          Object.entries(cats)
            .map(([name, val]) => ({ name, ...val }))
            .sort((a, b) => b.totalValue - a.totalValue)
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const formatCurrency = (n) => `Rs. ${Number(n).toFixed(2)}`;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Partially Dispensed": "bg-blue-100 text-blue-800",
    Dispensed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const printReport = () => {
    printFormalReport({
      title: "Pharmacy Reports",
      subtitle: "Inventory and prescription summary",
      periodLabel: "Period: Current snapshot",
      bodyHtml: getPrintableHtml(bodyRef.current),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 flex items-center justify-center text-gray-500">Loading...</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            <div className="no-print mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Pharmacy Reports</h1>
              <button
                onClick={printReport}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Print Report
              </button>
            </div>

            {error && (
              <div className="no-print bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            <div ref={bodyRef} className="print-report-body">

            {/* Medicine Stats */}
            {medicineStats && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Inventory Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Medicines", value: medicineStats.totalMedicines, color: "blue" },
                    { label: "Low Stock", value: medicineStats.lowStockCount, color: "orange" },
                    { label: "Expiring (90d)", value: medicineStats.expiringCount, color: "yellow" },
                    { label: "Expired", value: medicineStats.expiredCount, color: "red" },
                    { label: "Total Value", value: formatCurrency(medicineStats.totalInventoryValue), color: "green" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription Stats */}
            {prescriptionStats && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Prescription Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Total", value: prescriptionStats.total, color: "blue" },
                    { label: "Pending", value: prescriptionStats.pending, color: "yellow" },
                    { label: "Dispensed", value: prescriptionStats.dispensed, color: "green" },
                    { label: "Partially Dispensed", value: prescriptionStats.partiallyDispensed, color: "blue" },
                    { label: "Cancelled", value: prescriptionStats.cancelled, color: "red" },
                    { label: "Last 30 Days", value: prescriptionStats.recentTotal, color: "purple" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Category Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Inventory by Category</h2>
                {categoryBreakdown.length === 0 ? (
                  <p className="text-gray-500 text-sm">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {categoryBreakdown.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium w-40 truncate">{cat.name}</span>
                        <span className="text-gray-500">{cat.count} items</span>
                        <span className="text-gray-500">Stock: {cat.totalStock}</span>
                        <span className="text-green-600 font-semibold">{formatCurrency(cat.totalValue)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Alert */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Low Stock Medicines</h2>
                {lowStock.length === 0 ? (
                  <p className="text-gray-500 text-sm">All medicines are adequately stocked</p>
                ) : (
                  <div className="space-y-2">
                    {lowStock.map((med) => (
                      <div key={med._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <span className="font-medium text-gray-800">{med.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{med.strength}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-orange-600 font-semibold">{med.stockQuantity}</span>
                          <span className="text-xs text-gray-400">/ {med.reorderLevel} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Prescriptions</h2>
              {recentPrescriptions.length === 0 ? (
                <p className="text-gray-500 text-sm">No prescriptions found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Rx ID", "Patient", "Doctor", "Items", "Date", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPrescriptions.map((rx) => (
                        <tr key={rx._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{rx.prescriptionId}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {rx.patient?.firstName} {rx.patient?.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{rx.medicines.length}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDate(rx.createdAt)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[rx.status]}`}>
                              {rx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
