import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMedicineStatsRequest, getLowStockRequest, getExpiringMedicinesRequest } from "../../services/medicineService.js";
import { getPrescriptionStatsRequest, getAllPrescriptionsRequest } from "../../services/prescriptionService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Partially Dispensed": "bg-blue-100 text-blue-800",
  Dispensed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function PharmacyOverview() {
  const navigate = useNavigate();
  const [medicineStats, setMedicineStats] = useState(null);
  const [prescriptionStats, setPrescriptionStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [mStats, pStats, lowStockData, expiringData, prescData] = await Promise.all([
          getMedicineStatsRequest(),
          getPrescriptionStatsRequest(),
          getLowStockRequest(),
          getExpiringMedicinesRequest(30),
          getAllPrescriptionsRequest(),
        ]);
        setMedicineStats(mStats.stats);
        setPrescriptionStats(pStats.stats);
        setLowStock(lowStockData.medicines.slice(0, 8));
        setExpiring(expiringData.medicines.slice(0, 8));
        setRecentPrescriptions(prescData.prescriptions.slice(0, 15));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load pharmacy overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (n) => `Rs. ${Number(n).toFixed(2)}`;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

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

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Pharmacy Overview</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor inventory, prescriptions, and alerts</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            {/* Inventory Stats */}
            {medicineStats && (
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-3">Inventory</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Medicines", value: medicineStats.totalMedicines, color: "blue", icon: "💊" },
                    { label: "Low Stock", value: medicineStats.lowStockCount, color: "orange", icon: "📉" },
                    { label: "Expiring (90d)", value: medicineStats.expiringCount, color: "yellow", icon: "🕐" },
                    { label: "Expired", value: medicineStats.expiredCount, color: "red", icon: "⚠️" },
                    { label: "Total Value", value: formatCurrency(medicineStats.totalInventoryValue), color: "green", icon: "💰" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className={`text-xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription Stats */}
            {prescriptionStats && (
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-3">Prescriptions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Total", value: prescriptionStats.total, color: "blue" },
                    { label: "Pending", value: prescriptionStats.pending, color: "yellow" },
                    { label: "Dispensed", value: prescriptionStats.dispensed, color: "green" },
                    { label: "Partial", value: prescriptionStats.partiallyDispensed, color: "blue" },
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

            {/* Alerts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Low Stock */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-700">⚠ Low Stock Medicines</h2>
                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                    {lowStock.length} items
                  </span>
                </div>
                {lowStock.length === 0 ? (
                  <p className="text-gray-400 text-sm">All medicines adequately stocked</p>
                ) : (
                  <div className="space-y-2">
                    {lowStock.map((med) => (
                      <div key={med._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <span className="font-medium text-gray-800">{med.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{med.strength}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${med.stockQuantity === 0 ? "text-red-600" : "text-orange-600"}`}>
                            {med.stockQuantity}
                          </span>
                          <span className="text-xs text-gray-400">/ {med.reorderLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiring soon */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-700">🕐 Expiring Within 30 Days</h2>
                  <span className="text-xs text-yellow-700 font-medium bg-yellow-50 px-2 py-1 rounded-full">
                    {expiring.length} items
                  </span>
                </div>
                {expiring.length === 0 ? (
                  <p className="text-gray-400 text-sm">No medicines expiring in next 30 days</p>
                ) : (
                  <div className="space-y-2">
                    {expiring.map((med) => {
                      const daysLeft = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={med._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <span className="font-medium text-gray-800">{med.name}</span>
                            <span className="text-xs text-gray-400 ml-2">{med.strength}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatDate(med.expiryDate)}</span>
                            <span className={`text-xs font-bold ${daysLeft <= 7 ? "text-red-600" : "text-yellow-600"}`}>
                              {daysLeft}d
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Prescriptions</h2>
              {recentPrescriptions.length === 0 ? (
                <p className="text-gray-400 text-sm">No prescriptions found</p>
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
                          <td className="px-4 py-3 text-gray-500 text-xs">{rx.prescriptionId}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {rx.patient?.firstName} {rx.patient?.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{rx.medicines.length}</td>
                          <td className="px-4 py-3 text-gray-500">{formatDate(rx.createdAt)}</td>
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
        </main>
      </div>
    </div>
  );
}
