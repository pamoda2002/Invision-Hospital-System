import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoctorRequest } from "../../../services/doctorService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5">
        <span>{icon}</span>{title}
      </h2>
      {children}
    </div>
  );
}

export default function AddDoctor() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [success, setSuccess]   = useState("");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", specialization: "",
    department: "", phone: "", email: "", schedule: [],
  });
  const [slot, setSlot] = useState({ day: "", startTime: "", endTime: "" });

  const set = (field, val) => setFormData((p) => ({ ...p, [field]: val }));

  const addSlot = () => {
    if (!slot.day || !slot.startTime || !slot.endTime) return;
    setFormData((p) => ({ ...p, schedule: [...p.schedule, { ...slot }] }));
    setSlot({ day: "", startTime: "", endTime: "" });
  };

  const removeSlot = (i) =>
    setFormData((p) => ({ ...p, schedule: p.schedule.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await addDoctorRequest(formData);
      setSuccess(
        `✅ Doctor registered successfully! Login credentials — Email: ${formData.email} · Password: 12345678`
      );
      setTimeout(() => navigate("/admin/staff"), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
                  Staff Management → Doctors
                </p>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Doctor</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Registers a Doctor account, Doctor profile, and Staff record automatically
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/staff")}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium"
              >
                ← Back to Staff
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3.5 rounded-2xl text-sm font-medium">
                {success}
                <p className="text-xs text-green-600 mt-1">Redirecting to Staff List in 5 seconds…</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal details */}
              <Section title="Personal & Professional Details" icon="👨‍⚕️">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                    <input value={formData.firstName} onChange={(e) => set("firstName", e.target.value)}
                      required placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                    <input value={formData.lastName} onChange={(e) => set("lastName", e.target.value)}
                      required placeholder="Last name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Specialization <span className="text-red-500">*</span></label>
                    <input value={formData.specialization} onChange={(e) => set("specialization", e.target.value)}
                      required placeholder="e.g. Cardiologist" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Department <span className="text-red-500">*</span></label>
                    <input value={formData.department} onChange={(e) => set("department", e.target.value)}
                      required placeholder="e.g. Cardiology" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                    <input value={formData.phone} onChange={(e) => set("phone", e.target.value)}
                      required placeholder="+94 xx xxx xxxx" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                    <input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)}
                      required placeholder="doctor@hospital.com" className={inputCls} />
                  </div>
                </div>

                {/* Default password note */}
                <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">ℹ️</span>
                  <p className="text-xs text-blue-700">
                    A login account will be created automatically. Default password:{" "}
                    <span className="font-mono font-bold">12345678</span> — the doctor should change this after first login.
                  </p>
                </div>
              </Section>

              {/* Weekly schedule */}
              <Section title="Weekly Schedule" icon="📅">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Day</label>
                    <select value={slot.day} onChange={(e) => setSlot((p) => ({ ...p, day: e.target.value }))}
                      className={inputCls}>
                      <option value="">Select day</option>
                      {DAYS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Start Time</label>
                    <input type="time" value={slot.startTime}
                      onChange={(e) => setSlot((p) => ({ ...p, startTime: e.target.value }))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Time</label>
                    <div className="flex gap-2">
                      <input type="time" value={slot.endTime}
                        onChange={(e) => setSlot((p) => ({ ...p, endTime: e.target.value }))}
                        className={inputCls} />
                      <button type="button" onClick={addSlot}
                        disabled={!slot.day || !slot.startTime || !slot.endTime}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors flex-shrink-0">
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {formData.schedule.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No schedule slots added yet</p>
                ) : (
                  <div className="space-y-2">
                    {formData.schedule.map((s, i) => (
                      <div key={i} className="flex justify-between items-center bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl">
                        <span className="text-sm font-semibold text-blue-800">
                          {s.day}: {s.startTime} – {s.endTime}
                        </span>
                        <button type="button" onClick={() => removeSlot(i)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* What gets created info box */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">What gets created</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon:"👤", title:"User Account",   desc:"Login credentials with Doctor role" },
                    { icon:"👨‍⚕️", title:"Doctor Profile", desc:"Linked to appointments, records & lab tests" },
                    { icon:"🏥", title:"Staff Record",    desc:"Visible in Staff Management with attendance & leave" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pb-6">
                <button type="button" onClick={() => navigate("/admin/staff")}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Registering…
                    </span>
                  ) : "Register Doctor"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
