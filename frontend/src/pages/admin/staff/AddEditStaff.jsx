import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addStaffRequest,
  updateStaffRequest,
  getStaffByIdRequest,
} from "../../../services/staffService.js";
import { addDoctorRequest } from "../../../services/doctorService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const ROLES = [
  "Administrator","Doctor","Nurse","Receptionist","Laboratory Staff",
  "Pharmacist","Accountant","Security","Cleaner","IT Staff","Other",
];
const DEPARTMENTS = [
  "Administration","Medical","Nursing","Laboratory","Pharmacy",
  "Finance","Reception","IT","Security","Housekeeping","Other",
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const EMPLOYMENT_TYPES = ["Full-Time","Part-Time","Contract","Intern"];
const GENDERS          = ["Male","Female","Other"];
const STATUSES         = ["Active","Inactive","Suspended","Resigned"];

const EMPTY = {
  firstName:"", lastName:"", email:"", phone:"", role:"Receptionist",
  department:"Reception", designation:"", employmentType:"Full-Time",
  joinDate: new Date().toISOString().split("T")[0],
  salary:"", nationalId:"", address:"", gender:"Male",
  dateOfBirth:"", status:"Active", notes:"",
  emergencyContact: { name:"", relationship:"", phone:"" },
};

const EMPTY_DOCTOR = { specialization:"", schedule:[] };
const EMPTY_SLOT   = { day:"", startTime:"", endTime:"" };

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5";

function Section({ title, icon, children, highlight }) {
  return (
    <div className={`rounded-2xl border shadow-card p-6 ${highlight ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"}`}>
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

export default function AddEditStaff() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEdit     = Boolean(id);

  const [form,      setForm]      = useState(EMPTY);
  const [docForm,   setDocForm]   = useState(EMPTY_DOCTOR);
  const [slot,      setSlot]      = useState(EMPTY_SLOT);
  const [loading,   setLoading]   = useState(isEdit);
  const [submitting,setSubmitting] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  const isDoctor = form.role === "Doctor";

  // When role changes to Doctor, auto-set department to Medical
  useEffect(() => {
    if (form.role === "Doctor" && form.department !== "Medical") {
      setForm((p) => ({ ...p, department: "Medical" }));
    }
  }, [form.role]);

  useEffect(() => {
    if (!isEdit) return;
    getStaffByIdRequest(id)
      .then(({ staff: s }) => {
        setForm({
          firstName: s.firstName, lastName: s.lastName, email: s.email,
          phone: s.phone || "", role: s.role, department: s.department,
          designation: s.designation || "", employmentType: s.employmentType,
          joinDate: s.joinDate ? s.joinDate.split("T")[0] : "",
          salary: s.salary ?? "", nationalId: s.nationalId || "",
          address: s.address || "", gender: s.gender || "Male",
          dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
          status: s.status, notes: s.notes || "",
          emergencyContact: s.emergencyContact || { name:"", relationship:"", phone:"" },
        });
      })
      .catch(() => setError("Failed to load staff member"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set    = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const setEC  = (f, v) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, [f]: v } }));
  const setDoc = (f, v) => setDocForm((p) => ({ ...p, [f]: v }));

  const addSlot = () => {
    if (!slot.day || !slot.startTime || !slot.endTime) return;
    setDocForm((p) => ({ ...p, schedule: [...p.schedule, { ...slot }] }));
    setSlot(EMPTY_SLOT);
  };
  const removeSlot = (i) =>
    setDocForm((p) => ({ ...p, schedule: p.schedule.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      if (isEdit) {
        await updateStaffRequest(id, form);
        setSuccess("Staff member updated successfully");
      } else if (isDoctor) {
        // Register as doctor (creates User + Doctor + Staff records)
        await addDoctorRequest({
          firstName:      form.firstName,
          lastName:       form.lastName,
          email:          form.email,
          phone:          form.phone,
          department:     form.department || "Medical",
          specialization: docForm.specialization,
          schedule:       docForm.schedule,
        });
        setSuccess(
          `✅ Doctor registered! Login — Email: ${form.email} · Password: 12345678`
        );
        setTimeout(() => navigate("/admin/staff"), 4000);
      } else {
        await addStaffRequest(form);
        setSuccess(
          `✅ Staff registered! Login — Email: ${form.email} · Password: 12345678`
        );
        setTimeout(() => navigate("/admin/staff"), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f0f4f8]">
        <Sidebar /><div className="flex-1 flex flex-col"><TopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 animate-pulse font-medium">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
                  Staff Management
                </p>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {isEdit ? "Edit Staff Member" : "Register New Staff"}
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {isEdit
                    ? "Update employee information"
                    : isDoctor
                      ? "Registering a Doctor — creates User account, Doctor profile and Staff record"
                      : "Add a new employee to the system"}
                </p>
              </div>
              <button onClick={() => navigate("/admin/staff")}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                ← Back
              </button>
            </div>

            {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold">{error}</div>}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-2xl text-sm font-semibold">
                {success}
                {isDoctor && !isEdit && <p className="text-xs text-green-600 mt-1">Redirecting to Staff List in 4 seconds…</p>}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Doctor banner ── */}
              {isDoctor && !isEdit && (
                <div className="flex items-start gap-3 px-5 py-4 bg-blue-600 text-white rounded-2xl shadow-sm">
                  <span className="text-2xl flex-shrink-0">👨‍⚕️</span>
                  <div>
                    <p className="font-bold text-sm">Doctor Registration Mode</p>
                    <p className="text-xs text-blue-100 mt-0.5">
                      This will create a login account (role: Doctor), a Doctor profile, and a Staff record all at once.
                      Default password: <span className="font-mono font-bold">12345678</span>
                    </p>
                  </div>
                </div>
              )}

              {/* ── Personal Info ── */}
              <Section title="Personal Information" icon="👤">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                    <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)}
                      required placeholder="First name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                    <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)}
                      required placeholder="Last name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
                      {GENDERS.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                      required placeholder="email@hospital.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone {isDoctor && <span className="text-red-500">*</span>}</label>
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                      required={isDoctor} placeholder="+94 xx xxx xxxx" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>National ID</label>
                    <input value={form.nationalId} onChange={(e) => set("nationalId", e.target.value)}
                      placeholder="NIC / Passport" className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Address</label>
                    <input value={form.address} onChange={(e) => set("address", e.target.value)}
                      placeholder="Home address" className={inputCls} />
                  </div>
                </div>
              </Section>

              {/* ── Employment Details ── */}
              <Section title="Employment Details" icon="🏥">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Role <span className="text-red-500">*</span></label>
                    <select value={form.role} onChange={(e) => set("role", e.target.value)} required className={inputCls}>
                      {ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Department <span className="text-red-500">*</span></label>
                    <select value={form.department} onChange={(e) => set("department", e.target.value)} required className={inputCls}>
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Designation</label>
                    <input value={form.designation} onChange={(e) => set("designation", e.target.value)}
                      placeholder="e.g. Senior Nurse" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Employment Type</label>
                    <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inputCls}>
                      {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Join Date <span className="text-red-500">*</span></label>
                    <input type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)}
                      required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Salary (Rs.)</label>
                    <input type="number" value={form.salary} onChange={(e) => set("salary", e.target.value)}
                      min={0} placeholder="Monthly salary" className={inputCls} />
                  </div>
                  {isEdit && (
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── Doctor-specific section ── shown only when role = Doctor and not editing */}
              {isDoctor && !isEdit && (
                <Section title="Doctor Details" icon="🩺" highlight>
                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Specialization <span className="text-red-500">*</span></label>
                      <input
                        value={docForm.specialization}
                        onChange={(e) => setDoc("specialization", e.target.value)}
                        required
                        placeholder="e.g. Cardiologist, Neurologist"
                        className={inputCls}
                      />
                    </div>

                    {/* Schedule builder */}
                    <div>
                      <label className={labelCls}>Weekly Schedule</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <select value={slot.day} onChange={(e) => setSlot((p) => ({ ...p, day: e.target.value }))}
                            className={inputCls}>
                            <option value="">Select day</option>
                            {DAYS.map((d) => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <input type="time" value={slot.startTime}
                            onChange={(e) => setSlot((p) => ({ ...p, startTime: e.target.value }))}
                            className={inputCls} placeholder="Start time" />
                        </div>
                        <div className="flex gap-2">
                          <input type="time" value={slot.endTime}
                            onChange={(e) => setSlot((p) => ({ ...p, endTime: e.target.value }))}
                            className={inputCls} placeholder="End time" />
                          <button type="button" onClick={addSlot}
                            disabled={!slot.day || !slot.startTime || !slot.endTime}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 flex-shrink-0 transition-colors">
                            + Add
                          </button>
                        </div>
                      </div>
                      {docForm.schedule.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No schedule slots added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {docForm.schedule.map((s, i) => (
                            <div key={i} className="flex items-center justify-between bg-white border border-blue-100 px-4 py-2.5 rounded-xl">
                              <span className="text-sm font-semibold text-blue-800">
                                {s.day}: {s.startTime} – {s.endTime}
                              </span>
                              <button type="button" onClick={() => removeSlot(i)}
                                className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              )}

              {/* ── Emergency Contact ── */}
              <Section title="Emergency Contact" icon="🚨">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Contact Name</label>
                    <input value={form.emergencyContact.name} onChange={(e) => setEC("name", e.target.value)}
                      placeholder="Full name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Relationship</label>
                    <input value={form.emergencyContact.relationship} onChange={(e) => setEC("relationship", e.target.value)}
                      placeholder="e.g. Spouse, Parent" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input value={form.emergencyContact.phone} onChange={(e) => setEC("phone", e.target.value)}
                      placeholder="+94 xx xxx xxxx" className={inputCls} />
                  </div>
                </div>
              </Section>

              {/* ── Notes ── */}
              <Section title="Additional Notes" icon="📝">
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  rows={3} placeholder="Any additional notes..."
                  className={inputCls} />
              </Section>

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pb-6">
                <button type="button" onClick={() => navigate("/admin/staff")}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {isDoctor ? "Registering Doctor…" : "Saving…"}
                    </span>
                  ) : isEdit ? "Save Changes" : isDoctor ? "Register Doctor" : "Register Staff"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
