import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllMedicinesRequest,
  deleteMedicineRequest,
  getMedicineStatsRequest,
} from "../../services/medicineService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const CATEGORIES = [
  "All",
  "Antibiotic",
  "Analgesic",
  "Antiviral",
  "Antifungal",
  "Antihistamine",
  "Antihypertensive",
  "Antidiabetic",
  "Cardiovascular",
  "Gastrointestinal",
  "Respiratory",
  "Vitamin & Supplement",
  "Other",
];

export default function MedicineInventory() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (category !== "All") filters.category = category;
      const [medsData, statsData] = await Promise.all([
        getAllMedicinesRequest(filters),
        getMedicineStatsRequest(),
      ]);
      setMedicines(medsData.medicines);
      setStats(statsData.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicineRequest(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove medicine");
    }
  };

  const isExpired = (date) => new Date(date) < new Date();
  const isExpiringSoon = (date) => {
    const d = new Date(date);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 90);
    return d >= new Date() && d <= threshold;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();
  const formatCurrency = (n) => `Rs. ${Number(n).toFixed(2)}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
              <button
                onClick={() => navigate("/pharmacist/medicines/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                + Add Medicine
              </button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                  { label: "Total Medicines", value: stats.totalMedicines, color: "blue" },
                  { label: "Low Stock", value: stats.lowStockCount, color: "orange" },
                  { label: "Expiring Soon", value: stats.expiringCount, color: "yellow" },
                  { label: "Expired", value: stats.expiredCount, color: "red" },
                  { label: "Inventory Value", value: formatCurrency(stats.totalInventoryValue), color: "green" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, generic name or ID..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Search
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
                No medicines found
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["ID", "Name", "Category", "Form", "Strength", "Stock", "Unit Price", "Expiry", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {medicines.map((med) => (
                        <tr key={med._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{med.medicineId}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{med.name}</div>
                            {med.genericName && (
                              <div className="text-xs text-gray-400">{med.genericName}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{med.category}</td>
                          <td className="px-4 py-3 text-gray-600">{med.dosageForm}</td>
                          <td className="px-4 py-3 text-gray-600">{med.strength}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                med.stockQuantity === 0
                                  ? "text-red-600"
                                  : med.stockQuantity <= med.reorderLevel
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {med.stockQuantity}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">(min {med.reorderLevel})</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{formatCurrency(med.unitPrice)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                isExpired(med.expiryDate)
                                  ? "bg-red-100 text-red-700"
                                  : isExpiringSoon(med.expiryDate)
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {formatDate(med.expiryDate)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/pharmacist/medicines/${med._id}/edit`)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(med)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Remove Medicine</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-medium">{deleteConfirm.name}</span>? This will deactivate it from inventory.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
