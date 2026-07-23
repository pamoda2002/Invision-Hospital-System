import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getAllAppointmentsRequest } from "../../services/appointmentService.js";
import { addMedicalRecordRequest, getMedicalRecordByIdRequest, updateMedicalRecordRequest } from "../../services/medicalRecordService.js";
import { getAllMedicinesRequest } from "../../services/medicineService.js";
import { createPrescriptionRequest } from "../../services/prescriptionService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const EMPTY_RX_ITEM = {
  medicine: "",       // MongoDB _id (set when suggestion is selected)
  medicineName: "",   // free-type display name
  dosage: "",
  frequency: "",
  duration: "",
  quantity: "",
  instructions: "",
};

const FREQUENCIES = [
  "Once daily", "Twice daily", "Three times daily", "Four times daily",
  "Every 4 hours", "Every 6 hours", "Every 8 hours", "Every 12 hours",
  "Once weekly", "As needed",
];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

// Typeahead input for medicines
function MedicineSearchInput({ value, onChange, onSelect, medicines }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const suggestions = value.trim().length > 0
    ? medicines.filter((m) =>
        m.name.toLowerCase().includes(value.toLowerCase()) ||
        (m.genericName && m.genericName.toLowerCase().includes(value.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Type medicine name..."
        required
        className={inputCls}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {suggestions.map((m) => (
            <li
              key={m._id}
              onMouseDown={() => { onSelect(m); setOpen(false); }}
              className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer"
            >
              <div>
                <span className="font-medium text-gray-800">{m.name}</span>
                {m.genericName && <span className="text-gray-400 ml-1">({m.genericName})</span>}
                <span className="ml-2 text-xs text-gray-500">{m.strength} · {m.dosageForm}</span>
              </div>
              <span className={`text-xs font-semibold ml-3 ${m.stockQuantity === 0 ? "text-red-500" : m.stockQuantity <= m.reorderLevel ? "text-orange-500" : "text-green-600"}`}>
                {m.stockQuantity === 0 ? "Out of stock" : `Stock: ${m.stockQuantity}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddEditMedicalRecord() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  // Medical record
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    patient: searchParams.get("patientId") || "",
    diagnosis: "",
    symptoms: searchParams.get("reason") || "",
    prescription: "",
    treatmentNotes: "",
    medicalReport: "",
    date: searchParams.get("date") || new Date().toISOString().split("T")[0],
  });

  // Prescription
  const [medicines, setMedicines] = useState([]);
  const [includePrescription, setIncludePrescription] = useState(false);
  const [rxItems, setRxItems] = useState([{ ...EMPTY_RX_ITEM }]);
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxNotes, setRxNotes] = useState("");
  const [rxSubmitting, setRxSubmitting] = useState(false);
  const [rxError, setRxError] = useState("");
  const [rxSuccess, setRxSuccess] = useState("");

  const loadPatients = async () => {
    try {
      const data = await getAllAppointmentsRequest();
      const seen = new Set();
      const unique = [];
      for (const apt of data.appointments) {
        if (apt.patient && !seen.has(apt.patient._id)) {
          seen.add(apt.patient._id);
          unique.push(apt.patient);
        }
      }
      setPatients(unique);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients");
    }
  };

  const loadMedicines = async () => {
    try {
      const data = await getAllMedicinesRequest();
      setMedicines(data.medicines);
    } catch {
      // non-blocking
    }
  };

  const loadRecord = async () => {
    try {
      const data = await getMedicalRecordByIdRequest(id);
      const r = data.record;
      setFormData({
        patient: r.patient._id,
        diagnosis: r.diagnosis,
        symptoms: r.symptoms || "",
        prescription: r.prescription || "",
        treatmentNotes: r.treatmentNotes || "",
        medicalReport: r.medicalReport || "",
        date: new Date(r.date).toISOString().split("T")[0],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medical record");
    }
  };

  useEffect(() => {
    loadPatients();
    loadMedicines();
    if (isEdit) loadRecord();
  }, [id]);

  useEffect(() => {
    if (formData.diagnosis && !rxDiagnosis) {
      setRxDiagnosis(formData.diagnosis);
    }
  }, [formData.diagnosis]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await updateMedicalRecordRequest(id, formData);
      } else {
        await addMedicalRecordRequest(formData);
      }
      navigate("/doctor/medical-records");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save medical record");
    } finally {
      setLoading(false);
    }
  };

  // Rx item helpers
  const handleRxItemChange = (index, field, value) => {
    setRxItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMedicineSelect = (index, med) => {
    setRxItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], medicine: med._id, medicineName: med.name };
      return updated;
    });
  };

  const addRxItem = () => setRxItems((p) => [...p, { ...EMPTY_RX_ITEM }]);
  const removeRxItem = (index) => {
    if (rxItems.length === 1) return;
    setRxItems((p) => p.filter((_, i) => i !== index));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      setRxError("Please select a patient first in the medical record section above.");
      return;
    }
    if (rxItems.some((i) => !i.medicineName.trim() || !i.dosage || !i.frequency || !i.duration || !i.quantity)) {
      setRxError("Please fill in all required medicine fields.");
      return;
    }
    setRxSubmitting(true);
    setRxError("");
    setRxSuccess("");
    try {
      await createPrescriptionRequest({
        patient: formData.patient,
        diagnosis: rxDiagnosis || formData.diagnosis,
        notes: rxNotes,
        medicines: rxItems.map((i) => ({
          ...(i.medicine ? { medicine: i.medicine } : {}),
          medicineName: i.medicineName.trim(),
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          quantity: Number(i.quantity),
          instructions: i.instructions,
        })),
      });
      setRxSuccess("Prescription sent to pharmacy successfully.");
      setRxItems([{ ...EMPTY_RX_ITEM }]);
      setRxDiagnosis("");
      setRxNotes("");
      setIncludePrescription(false);
    } catch (err) {
      setRxError(err.response?.data?.message || "Failed to create prescription.");
    } finally {
      setRxSubmitting(false);
    }
  };

  const generateReport = () => {
    const p = patients.find((pt) => pt._id === formData.patient);
    const report = `MEDICAL REPORT\nPatient: ${p?.firstName} ${p?.lastName}\nDate: ${formData.date}\nDiagnosis: ${formData.diagnosis}\nSymptoms: ${formData.symptoms}\nPrescription: ${formData.prescription}\nTreatment Notes: ${formData.treatmentNotes}`.trim();
    setFormData((prev) => ({ ...prev, medicalReport: report }));
  };

  const printReport = () => {
    const p = patients.find((pt) => pt._id === formData.patient);
    const content = `MEDICAL REPORT\n================================\nPatient: ${p?.firstName} ${p?.lastName}\nPatient ID: ${p?.patientId}\nDate: ${formData.date}\n================================\nDiagnosis: ${formData.diagnosis}\n\nSymptoms: ${formData.symptoms}\n\nPrescription: ${formData.prescription}\n\nTreatment Notes: ${formData.treatmentNotes}\n================================`.trim();
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Medical Report</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6}pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px}</style></head><body><pre>${content}</pre></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Medical Record Form ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                {isEdit ? "Edit Medical Record" : "Add New Medical Record"}
              </h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    <select name="patient" value={formData.patient} onChange={handleInputChange} required disabled={isEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select a patient</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis <span className="text-red-500">*</span></label>
                    <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} required
                      placeholder="Enter diagnosis"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                    <textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} rows={3}
                      placeholder="Describe symptoms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Notes</label>
                    <textarea name="prescription" value={formData.prescription} onChange={handleInputChange} rows={3}
                      placeholder="Enter general prescription details / notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Notes</label>
                    <textarea name="treatmentNotes" value={formData.treatmentNotes} onChange={handleInputChange} rows={3}
                      placeholder="Enter treatment notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="flex items-end space-x-2">
                    <button type="button" onClick={generateReport} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">Generate Report</button>
                    <button type="button" onClick={printReport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Print Report</button>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Report</label>
                    <textarea name="medicalReport" value={formData.medicalReport} onChange={handleInputChange} rows={6}
                      placeholder="Medical report"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => navigate("/doctor/medical-records")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                  <button type="submit" disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                    {loading ? "Saving..." : isEdit ? "Update Record" : "Add Record"}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Pharmacy Prescription Section ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Pharmacy Prescription</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Send a medicine prescription directly to the pharmacy</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIncludePrescription((v) => !v); setRxError(""); setRxSuccess(""); }}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${includePrescription ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {includePrescription ? "Close" : "+ Add Prescription"}
                </button>
              </div>

              {rxSuccess && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">{rxSuccess}</div>
              )}

              {includePrescription && (
                <form onSubmit={handleCreatePrescription} className="mt-6 space-y-5">
                  {rxError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">{rxError}</div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                      <input type="text" value={rxDiagnosis} onChange={(e) => setRxDiagnosis(e.target.value)}
                        placeholder="Pre-filled from medical record"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacist Notes</label>
                      <input type="text" value={rxNotes} onChange={(e) => setRxNotes(e.target.value)}
                        placeholder="e.g. Take after meals"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* Medicine items */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Medicines <span className="text-red-500">*</span></h3>
                      <button type="button" onClick={addRxItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Medicine</button>
                    </div>

                    <div className="space-y-3">
                      {rxItems.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                          {rxItems.length > 1 && (
                            <button type="button" onClick={() => removeRxItem(index)}
                              className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-medium">
                              Remove
                            </button>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className={labelCls}>
                                Medicine Name <span className="text-red-500">*</span>
                                <span className="text-gray-400 font-normal ml-1">(type to search inventory)</span>
                              </label>
                              <MedicineSearchInput
                                value={item.medicineName}
                                medicines={medicines}
                                onChange={(val) => handleRxItemChange(index, "medicineName", val)}
                                onSelect={(med) => handleMedicineSelect(index, med)}
                              />
                              {item.medicine && (() => {
                                const m = medicines.find((m) => m._id === item.medicine);
                                return m ? (
                                  <p className={`text-xs mt-1 ${m.stockQuantity === 0 ? "text-red-500" : m.stockQuantity <= m.reorderLevel ? "text-orange-500" : "text-green-600"}`}>
                                    {m.stockQuantity === 0 ? "⚠ Out of stock" : `Available: ${m.stockQuantity} units · ${m.strength} · ${m.dosageForm}`}
                                  </p>
                                ) : null;
                              })()}
                            </div>
                            <div>
                              <label className={labelCls}>Dosage <span className="text-red-500">*</span></label>
                              <input type="text" value={item.dosage} onChange={(e) => handleRxItemChange(index, "dosage", e.target.value)}
                                required placeholder="e.g. 500mg" className={inputCls} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className={labelCls}>Frequency <span className="text-red-500">*</span></label>
                              <select value={item.frequency} onChange={(e) => handleRxItemChange(index, "frequency", e.target.value)} required className={inputCls}>
                                <option value="">Select</option>
                                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Duration <span className="text-red-500">*</span></label>
                              <input type="text" value={item.duration} onChange={(e) => handleRxItemChange(index, "duration", e.target.value)}
                                required placeholder="e.g. 7 days" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Quantity <span className="text-red-500">*</span></label>
                              <input type="number" value={item.quantity} onChange={(e) => handleRxItemChange(index, "quantity", e.target.value)}
                                required min="1" placeholder="0" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Instructions</label>
                              <input type="text" value={item.instructions} onChange={(e) => handleRxItemChange(index, "instructions", e.target.value)}
                                placeholder="e.g. After meals" className={inputCls} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button type="submit" disabled={rxSubmitting || !formData.patient}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50">
                      {rxSubmitting ? "Sending to Pharmacy..." : "Send Prescription to Pharmacy"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
