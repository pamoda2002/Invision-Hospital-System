import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingPrescriptionsRequest,
  dispensePrescriptionRequest,
  cancelPrescriptionRequest,
} from "../../services/prescriptionService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Partially Dispensed": "bg-blue-100 text-blue-800",
  Dispensed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function ProcessPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await getPendingPrescriptionsRequest();
      setPrescriptions(data.prescriptions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleDispense = async (id) => {
    setProcessingId(id);
    setError("");
    try {
      await dispensePrescriptionRequest(id);
      loadPrescriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispense prescription");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setProcessingId(cancelModal._id);
    setError("");
    try {
      await cancelPrescriptionRequest(cancelModal._id, cancelReason);
      setCancelModal(null);
      setCancelReason("");
      loadPrescriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel prescription");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">

            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Process Prescriptions</h1>
                <p className="text-sm text-gray-500 mt-1">Pending & partially dispensed prescriptions</p>
              </div>
              <button
                onClick={() => navigate("/pharmacist/prescriptions/all")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                View All Prescriptions
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">
                No pending prescriptions
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <div key={rx._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Prescription header */}
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
                            Rx ID: {rx.prescriptionId} • {formatDate(rx.createdAt)} • Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}
                          </p>
                          {rx.diagnosis && (
                            <p className="text-sm text-gray-600 mt-1">Diagnosis: {rx.diagnosis}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">{expandedId === rx._id ? "▲" : "▼"} {rx.medicines.length} item(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded medicine list */}
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
                                    {item.medicine?.stockQuantity !== undefined && (
                                      <span className={`text-xs ml-2 ${item.medicine.stockQuantity < item.quantity ? "text-red-500" : "text-green-600"}`}>
                                        Stock: {item.medicine.stockQuantity}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 pr-4 text-gray-600">{item.dosage}</td>
                                  <td className="py-2 pr-4 text-gray-600">{item.frequency}</td>
                                  <td className="py-2 pr-4 text-gray-600">{item.duration}</td>
                                  <td className="py-2 pr-4 font-semibold text-gray-800">{item.quantity}</td>
                                  <td className="py-2 text-gray-500 text-xs">{item.instructions || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {rx.notes && (
                          <p className="text-sm text-gray-500 mt-3 italic">Note: {rx.notes}</p>
                        )}

                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => { setCancelModal(rx); setCancelReason(""); }}
                            disabled={processingId === rx._id}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm"
                          >
                            Cancel Rx
                          </button>
                          <button
                            onClick={() => handleDispense(rx._id)}
                            disabled={processingId === rx._id}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                          >
                            {processingId === rx._id ? "Processing..." : "Dispense"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancel Prescription</h3>
            <p className="text-gray-600 mb-4">
              Cancel <span className="font-medium">{cancelModal.prescriptionId}</span> for{" "}
              <span className="font-medium">{cancelModal.patient?.firstName} {cancelModal.patient?.lastName}</span>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Enter cancellation reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={processingId === cancelModal._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {processingId === cancelModal._id ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
