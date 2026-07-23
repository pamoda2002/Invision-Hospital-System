import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllStaffRequest,
  getStaffStatsRequest,
  deleteStaffRequest,
} from "../../../services/staffService.js";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar from "../../../components/TopBar.jsx";

const DEPARTMENTS = [
  "All","Administration","Medical","Nursing","Laboratory",
  "Pharmacy","Finance","Reception","IT","Security","Housekeeping","Other",
];
const ROLES = [
  "All","Administrator","Doctor","Nurse","Receptionist",
  "Laboratory Staff","Pharmacist","Accountant","Security","Cleaner","IT Staff","Other",
];
const STATUSES = ["All","Active","Inactive","Suspended","Resigned"];

const STATUS_COLORS = {
  Active:    "bg-green-100 text-green-700",
  Inactive:  "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-700",
  Resigned:  "bg-orange-100 text-orange-700",
};

const DEPT_ICONS = {
  Medical:"🏥", Nursing:"🩺", Laboratory:"🔬", Pharmacy:"💊",
  Finance:"📊", Reception:"🏢", IT:"💻", Security:"🛡️",
  Housekeeping:"🧹", Administration:"⚙️", Other:"👤",
};

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">
          {loading ? <span className="text-gray-200 animate-pulse">—</span> : value}
        </p>
      </div>
    </div>
  );
}

export default function StaffList() {
  const navigate = useNavigate();
  const [staff, setStaff]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [dept, setDept]           = useState("All");
  const [role, setRole]           = useState("All");
  const [status, setStatus]       = useState("All");
  const [deleteModal, setDeleteModal] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (dept   !== "All") filters.department = dept;
      if (role   !== "All") filters.role       = role;
      if (status !== "All") filters.status     = status;
      const [sData, stData] = await Promise.all([
        getAllStaffRequest(filters),
        getStaffStatsRequest(),
      ]);
      setStaff(sData.staff);
      setStats(stData.stats);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [dept, role, status]);

  const handleSearch = (e) => { e.preventDefault(); load(); };

  const handleDelete = async (id) => {
    try {
      await deleteStaffRequest(id);
      setDeleteModal(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to deactivate staff");
    }
  };

  const initials = (s) =>
    `${s.firstName?.[0] || ""}${s.lastName?.[0] || ""}`.toUpperCase();

  const DEPT_COLOR = {
    Medical:"bg-blue-100 text-blue-600", Nursing:"bg-pink-100 text-pink-600",
    Laboratory:"bg-purple-100 text-purple-600", Pharmacy:"bg-green-100 text-green-600",
    Finance:"bg-amber-100 text-amber-600", Administration:"bg-indigo-100 text-indigo-600",
    Reception:"bg-teal-100 text-teal-600", IT:"bg-cyan-100 text-cyan-600",
    Security:"bg-slate-100 text-slate-600", Housekeeping:"bg-lime-100 text-lime-600",
    Other:"bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff Management</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage all hospital employees and their records</p>
            </div>
            <button
              onClick={() => navigate("/admin/staff/new")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
            >
              <span className="text-base">+</span> Register Staff
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Staff"    value={stats.total}     icon="👥" color="bg-blue-100 text-blue-600"   loading={loading} />
              <StatCard label="Active"         value={stats.active}    icon="✅" color="bg-green-100 text-green-600" loading={loading} />
              <StatCard label="Inactive"       value={stats.inactive}  icon="⏸️" color="bg-gray-100 text-gray-600"   loading={loading} />
              <StatCard label="Suspended"      value={stats.suspended} icon="🚫" color="bg-red-100 text-red-600"     loading={loading} />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, email, designation..."
                className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select value={dept} onChange={(e) => setDept(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
              </select>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
              </select>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
                Search
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full w-40" />
                      <div className="h-2.5 bg-gray-100 rounded-full w-24" />
                    </div>
                    <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-500 font-medium">No staff members found</p>
              <button onClick={() => navigate("/admin/staff/new")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">
                Register first staff member →
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Staff","ID","Department","Role","Employment","Join Date","Status","Actions"].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {staff.map((s) => (
                      <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${DEPT_COLOR[s.department] || "bg-gray-100 text-gray-600"}`}>
                              {initials(s)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                              <p className="text-xs text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{s.staffId}</td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-gray-700 text-xs font-medium">
                            <span>{DEPT_ICONS[s.department] || "🏥"}</span>
                            {s.department}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-xs">{s.role}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {s.employmentType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-xs">
                          {new Date(s.joinDate).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => navigate(`/admin/staff/${s._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors">
                              View
                            </button>
                            <span className="text-gray-200">|</span>
                            <button onClick={() => navigate(`/admin/staff/${s._id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors">
                              Edit
                            </button>
                            <span className="text-gray-200">|</span>
                            <button onClick={() => setDeleteModal(s)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors">
                              Deactivate
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
        </main>
      </div>

      {/* Deactivate modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deactivate Staff Member</h3>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to deactivate{" "}
              <span className="font-bold">{deleteModal.firstName} {deleteModal.lastName}</span>?
              They will be marked as Inactive.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteModal._id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
