import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addMedicineRequest,
  updateMedicineRequest,
  getMedicineByIdRequest,
  adjustStockRequest,
} from "../../services/medicineService.js";
import Sidebar from "../../components/Sidebar.jsx";
import TopBar from "../../components/TopBar.jsx";

const CATEGORIES = [
  "Antibiotic", "Analgesic", "Antiviral", "Antifungal", "Antihistamine",
  "Antihypertensive", "Antidiabetic", "Cardiovascular", "Gastrointestinal",
  "Respiratory", "Vitamin & Supplement", "Other",
];

const DOSAGE_FORMS = [
  "Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops", "Inhaler", "Other",
];

const EMPTY_FORM = {
  name: "",
  genericName: "",
  category: "Antibiotic",
  dosageForm: "Tablet",
  strength: "",
  manufacturer: "",
  stockQuantity: "",
  reorderLevel: "10",
  unitPrice: "",
  expiryDate: "",
  batchNumber: "",
  location: "",
  description: "",
};

export default function AddEditMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [stockAdjust, setStockAdjust] = useState("");
  const [stockAdjustType, setStockAdjustType] = useState("add");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      getMedicineByIdRequest(id)
        .then((data) => {
          const m = data.medicine;
          setFormData({
            name: m.name,
            genericName: m.genericName || "",
            category: m.category,
            dosageForm: m.dosageForm,
            strength: m.strength,
            manufacturer: m.manufacturer || "",
            stockQuantity: m.stockQuantity,
            reorderLevel: m.reorderLevel,
            unitPrice: m.unitPrice,
            expiryDate: m.expiryDate ? m.expiryDate.split("T")[0] : "",
            batchNumber: m.batchNumber || "",
            location: m.location || "",
            description: m.description || "",
          });
        })
        .catch(() => setError("Failed to load medicine"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await updateMedicineRequest(id, formData);
        setSuccess("Medicine updated successfully");
      } else {
        await addMedicineRequest(formData);
        setSuccess("Medicine added successfully");
        setTimeout(() => navigate("/pharmacist/medicines"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save medicine");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockAdjust = async (e) => {
    e.preventDefault();
    if (!stockAdjust) return;
    setSubmitting(true);
    setError("");
    try {
      const qty = stockAdjustType === "add" ? Number(stockAdjust) : -Number(stockAdjust);
      const data = await adjustStockRequest(id, qty);
      setFormData((prev) => ({ ...prev, stockQuantity: data.medicine.stockQuantity }));
      setStockAdjust("");
      setSuccess("Stock updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update stock");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </main>
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
          <div className="max-w-4xl mx-auto">

            {/* Stock Adjustment (edit mode only) */}
            {isEdit && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Stock Adjustment — Current: <span className="text-blue-600">{formData.stockQuantity}</span>
                </h2>
                <form onSubmit={handleStockAdjust} className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={stockAdjustType}
                    onChange={(e) => setStockAdjustType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                  </select>
                  <input
                    type="number"
                    value={stockAdjust}
                    onChange={(e) => setStockAdjust(e.target.value)}
                    placeholder="Quantity"
                    min="1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !stockAdjust}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Update Stock
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEdit ? "Edit Medicine" : "Add New Medicine"}
                </h1>
                <button
                  onClick={() => navigate("/pharmacist/medicines")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Medicine Name <span className="text-red-500">*</span></label>
                    <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="e.g. Paracetamol" />
                  </div>
                  <div>
                    <label className={labelClass}>Generic Name</label>
                    <input name="genericName" value={formData.genericName} onChange={handleChange} className={inputClass} placeholder="e.g. Acetaminophen" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Dosage Form <span className="text-red-500">*</span></label>
                    <select name="dosageForm" value={formData.dosageForm} onChange={handleChange} required className={inputClass}>
                      {DOSAGE_FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Strength <span className="text-red-500">*</span></label>
                    <input name="strength" value={formData.strength} onChange={handleChange} required className={inputClass} placeholder="e.g. 500mg" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Manufacturer</label>
                    <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} className={inputClass} placeholder="Manufacturer name" />
                  </div>
                  <div>
                    <label className={labelClass}>Batch Number</label>
                    <input name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={inputClass} placeholder="e.g. BT20240101" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Stock Quantity <span className="text-red-500">*</span></label>
                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" className={inputClass} placeholder="0" disabled={isEdit} />
                    {isEdit && <p className="text-xs text-gray-400 mt-1">Use Stock Adjustment above to change stock</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Reorder Level <span className="text-red-500">*</span></label>
                    <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} required min="0" className={inputClass} placeholder="10" />
                  </div>
                  <div>
                    <label className={labelClass}>Unit Price (Rs.) <span className="text-red-500">*</span></label>
                    <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required min="0" step="0.01" className={inputClass} placeholder="0.00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Expiry Date <span className="text-red-500">*</span></label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Storage Location</label>
                    <input name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Shelf A-3" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description / Notes</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} placeholder="Additional notes about this medicine" />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/pharmacist/medicines")}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Medicine"}
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
