import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpiringMedicinesRequest,
  getExpiredMedicinesRequest,
} from "../../services/medicineService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

export default function ExpiryAlerts() {
  const navigate = useNavigate();
  const [expiring, setExpiring] = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(90);
  const [activeTab, setActiveTab] = useState("expiring");

  const loadData = async () => {
    try {
      setLoading(true);
      const [expiringData, expiredData] = await Promise.all([
        getExpiringMedicinesRequest(days),
        getExpiredMedicinesRequest(),
      ]);
      setExpiring(expiringData.medicines);
      setExpired(expiredData.medicines);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expiry data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [days]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const daysUntilExpiry = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const MedicineTable = ({ medicines, type }) => (
    medicines.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        No {type === "expired" ? "expired" : "expiring"} medicines found
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Name", "Category", "Form", "Strength", "Stock", "Batch", "Expiry Date", type === "expired" ? "Expired" : "Days Left", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {medicines.map((med) => {
              const remaining = daysUntilExpiry(med.expiryDate);
              return (
                <tr key={med._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{med.medicineId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{med.name}</div>
                    {med.genericName && <div className="text-xs text-gray-400">{med.genericName}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{med.category}</td>
                  <td className="px-4 py-3 text-gray-600">{med.dosageForm}</td>
                  <td className="px-4 py-3 text-gray-600">{med.strength}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{med.stockQuantity}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{med.batchNumber || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${type === "expired" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {formatDate(med.expiryDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {type === "expired" ? (
                      <span className="text-red-600 font-semibold text-xs">
                        {Math.abs(remaining)}d ago
                      </span>
                    ) : (
                      <span className={`font-semibold text-xs ${remaining <= 30 ? "text-red-600" : remaining <= 60 ? "text-orange-600" : "text-yellow-600"}`}>
                        {remaining}d
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/pharmacist/medicines/${med._id}/edit`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Expiry Alerts</h1>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value={30}>Expiring in 30 days</option>
                <option value={60}>Expiring in 60 days</option>
                <option value={90}>Expiring in 90 days</option>
                <option value={180}>Expiring in 180 days</option>
              </select>
            </div>

            {/* Alert banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl">⚠️</div>
                <div>
                  <p className="font-semibold text-red-800">Expired Medicines</p>
                  <p className="text-2xl font-bold text-red-600">{expired.length}</p>
                  <p className="text-xs text-red-600">Must be removed from inventory immediately</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl">🕐</div>
                <div>
                  <p className="font-semibold text-yellow-800">Expiring Within {days} Days</p>
                  <p className="text-2xl font-bold text-yellow-600">{expiring.length}</p>
                  <p className="text-xs text-yellow-600">Review and reorder if necessary</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {[
                  { key: "expiring", label: `Expiring Soon (${expiring.length})` },
                  { key: "expired", label: `Expired (${expired.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              ) : (
                <div>
                  {activeTab === "expiring" && <MedicineTable medicines={expiring} type="expiring" />}
                  {activeTab === "expired" && <MedicineTable medicines={expired} type="expired" />}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
