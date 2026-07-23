import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorPrescriptionsRequest, cancelPrescriptionRequest } from "../../services/prescriptionService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Partially Dispensed": "bg-blue-100 text-blue-800",
  Dispensed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function PrescriptionList() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getDoctorPrescriptionsRequest();
      setPrescriptions(data.prescriptions);
      setFiltered(data.prescriptions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (statusFilter === "All") {
      setFiltered(prescriptions);
    } else {
      setFiltered(prescriptions.filter((rx) => rx.status === statusFilter));
    }
  }, [statusFilter, prescriptions]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setProcessingId(cancelModal._id);
    try {
      await cancelPrescriptionRequest(cancelModal._id, cancelReason);
      setCancelModal(null);
      setCancelReason("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel prescription");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const counts = prescriptions.reduce((acc, rx) => {
    acc[rx.status] = (acc[rx.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">

            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">My Prescriptions</h1>
              <button
                onClick={() => navigate("/doctor/prescriptions/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                + New Prescription
              </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: prescriptions.length, color: "blue" },
                { label: "Pending", value: counts["Pending"] || 0, color: "yellow" },
                { label: "Dispensed", value: counts["Dispensed"] || 0, color: "green" },
                { label: "Cancelled", value: counts["Cancelled"] || 0, color: "red" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["All", "Pending", "Partially Dispensed", "Dispensed", "Cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
                No prescriptions found
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((rx) => (
                  <div key={rx._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === rx._id ? null : rx._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-800">
                              {rx.patient?.firstName} {rx.patient?.lastName}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[rx.status]}`}>
                              {rx.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {rx.prescriptionId} • {formatDate(rx.createdAt)}
                          </p>
                          {rx.diagnosis && (
                            <p className="text-sm text-gray-600 mt-0.5">Diagnosis: {rx.diagnosis}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{rx.medicines.length} medicine(s)</span>
                          <span>{expandedId === rx._id ? "▲" : "▼"}</span>
                        </div>
                      </div>
                    </div>

                    {expandedId === rx._id && (
                      <div className="border-t border-gray-100 px-5 pb-5">
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                                <th className="pb-2 pr-4">Medicine</th>
                                <th className="pb-2 pr-4">Dosage</th>
                                <th className="pb-2 pr-4">Frequency</th>
                                <th className="pb-2 pr-4">Duration</th>
                                <th className="pb-2 pr-4">Qty</th>
                                <th className="pb-2">Instructions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {rx.medicines.map((item, i) => (
                                <tr key={i}>
                                  <td className="py-2 pr-4 font-medium text-gray-800">
                                    {item.medicineName}
                                    {item.medicine?.strength && (
                                      <span className="text-xs text-gray-400 ml-1">({item.medicine.strength})</span>
                                    )}
                                  </td>
                                  <td className="py-2 pr-4 text-gray-600">{item.dosage}</td>
                                  <td className="py-2 pr-4 text-gray-600">{item.frequency}</td>
                                  <td className="py-2 pr-4 text-gray-600">{item.duration}</td>
                                  <td className="py-2 pr-4 font-semibold">{item.quantity}</td>
                                  <td className="py-2 text-gray-500 text-xs">{item.instructions || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {rx.notes && (
                          <p className="text-sm text-gray-500 mt-3 italic">Note: {rx.notes}</p>
                        )}

                        {rx.status === "Dispensed" && (
                          <p className="text-xs text-green-600 mt-3">
                            Dispensed on {formatDate(rx.dispensedAt)} by {rx.dispensedBy?.fullName || "Pharmacist"}
                          </p>
                        )}

                        {rx.status === "Cancelled" && (
                          <p className="text-xs text-red-500 mt-3">
                            Cancelled: {rx.cancellationReason}
                          </p>
                        )}

                        {rx.status === "Pending" && (
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => { setCancelModal(rx); setCancelReason(""); }}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                            >
                              Cancel Prescription
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cancel Prescription</h3>
            <p className="text-gray-600 mb-4">
              Cancel <span className="font-medium">{cancelModal.prescriptionId}</span> for{" "}
              <span className="font-medium">{cancelModal.patient?.firstName} {cancelModal.patient?.lastName}</span>?
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Reason for cancellation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={processingId === cancelModal._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {processingId === cancelModal._id ? "Cancelling..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
