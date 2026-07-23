import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPrescriptionRequest } from "../../services/prescriptionService.js";
import { getAllMedicinesRequest } from "../../services/medicineService.js";
import { getAllAppointmentsRequest } from "../../services/appointmentService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const EMPTY_ITEM = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: "",
  instructions: "",
};

export default function CreatePrescription() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [formData, setFormData] = useState({ patient: "", diagnosis: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [apptData, medData] = await Promise.all([
          getAllAppointmentsRequest(),
          getAllMedicinesRequest(),
        ]);
        // Unique patients from this doctor's appointments
        const seen = new Set();
        const unique = [];
        for (const apt of apptData.appointments) {
          if (apt.patient && !seen.has(apt.patient._id)) {
            seen.add(apt.patient._id);
            unique.push(apt.patient);
          }
        }
        setPatients(unique);
        setMedicines(medData.medicines);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedMedicine = (id) => medicines.find((m) => m._id === id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some((i) => !i.medicine || !i.dosage || !i.frequency || !i.duration || !i.quantity)) {
      setError("Please fill in all required medicine fields");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createPrescriptionRequest({
        ...formData,
        medicines: items.map((i) => ({ ...i, quantity: Number(i.quantity) })),
      });
      navigate("/doctor/prescriptions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

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
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Create Prescription</h1>
                <button
                  onClick={() => navigate("/doctor/prescriptions")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Back
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Patient & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.patient}
                      onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.firstName} {p.lastName} ({p.patientId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      placeholder="Enter diagnosis"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Additional notes for pharmacist..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Medicine items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-semibold text-gray-700">
                      Medicines <span className="text-red-500">*</span>
                    </h2>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const med = selectedMedicine(item.medicine);
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
                        >
                          <div className="absolute top-3 right-3">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-400 hover:text-red-600 text-xs font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className={labelClass}>
                                Medicine <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={item.medicine}
                                onChange={(e) => handleItemChange(index, "medicine", e.target.value)}
                                required
                                className={inputClass}
                              >
                                <option value="">Select medicine</option>
                                {medicines.map((m) => (
                                  <option key={m._id} value={m._id}>
                                    {m.name} — {m.strength} ({m.dosageForm}) | Stock: {m.stockQuantity}
                                  </option>
                                ))}
                              </select>
                              {med && (
                                <p className={`text-xs mt-1 ${med.stockQuantity === 0 ? "text-red-500" : med.stockQuantity <= med.reorderLevel ? "text-orange-500" : "text-green-600"}`}>
                                  {med.stockQuantity === 0 ? "⚠ Out of stock" : `Available: ${med.stockQuantity} units`}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className={labelClass}>
                                Dosage <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={item.dosage}
                                onChange={(e) => handleItemChange(index, "dosage", e.target.value)}
                                required
                                placeholder="e.g. 500mg"
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className={labelClass}>
                                Frequency <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={item.frequency}
                                onChange={(e) => handleItemChange(index, "frequency", e.target.value)}
                                required
                                className={inputClass}
                              >
                                <option value="">Select</option>
                                {["Once daily", "Twice daily", "Three times daily", "Four times daily",
                                  "Every 4 hours", "Every 6 hours", "Every 8 hours", "Every 12 hours",
                                  "Once weekly", "As needed"].map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>
                                Duration <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={item.duration}
                                onChange={(e) => handleItemChange(index, "duration", e.target.value)}
                                required
                                placeholder="e.g. 7 days"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                required
                                min="1"
                                placeholder="0"
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Instructions</label>
                              <input
                                type="text"
                                value={item.instructions}
                                onChange={(e) => handleItemChange(index, "instructions", e.target.value)}
                                placeholder="e.g. After meals"
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/doctor/prescriptions")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Prescription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
