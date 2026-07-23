import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaHospital } from "react-icons/fa6";
import AuthLayout from "../../components/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_REDIRECTS = {
  Receptionist:      "/receptionist/dashboard",
  Administrator:     "/admin/dashboard",
  Doctor:            "/doctor/appointments",
  "Laboratory Staff":"/laboratory/dashboard",
  Pharmacist:        "/pharmacist/medicines",
};

export default function Login() {
  const { login, authBusy } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData]     = useState({ identifier: "", password: "", rememberMe: false });
  const [errors, setErrors]         = useState({});
  const [showPassword, setShowPass] = useState(false);
  const [serverError, setServerErr] = useState("");

  const validate = () => {
    const e = {};
    if (!formData.identifier.trim()) e.identifier = "Email or username is required";
    if (!formData.password)          e.password   = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p)  => ({ ...p, [name]: undefined }));
    setServerErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await login(formData);
      navigate(ROLE_REDIRECTS[res.user.role] || "/profile");
    } catch (err) {
      setServerErr(err?.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <AuthLayout>

      {/* Brand mark — visible on large screens inside form panel */}
      <div className="hidden lg:flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-md">
          <FaHospital className="text-white text-base" />
        </div>
        <div>
          <p className="font-black text-brand-800 text-sm tracking-tight leading-none">Invision HMS</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mt-0.5">Hospital Management</p>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-brand-500 mb-3">
          Staff Portal
        </p>
        <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight">
          Sign in to your<br />workspace
        </h1>
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">
          Access patient records, appointments, lab tests,<br className="hidden sm:block" />
          and pharmacy — all in one place.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
          <span className="text-red-500 text-base mt-0.5 flex-shrink-0">⚠</span>
          <p className="text-sm text-red-700 font-semibold">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Email / Username ── */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Email or Username
          </label>
          <div className={`flex items-center gap-3 rounded-2xl border-2 bg-slate-50 px-4 py-1 transition-all duration-200
            ${errors.identifier
              ? "border-red-400 bg-red-50/60"
              : "border-slate-200 focus-within:border-brand-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
            }`}>
            <FaEnvelope className="text-slate-400 text-sm flex-shrink-0" />
            <input
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="you@hospital.com"
              autoComplete="username"
              className="flex-1 bg-transparent py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
          {errors.identifier && (
            <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.identifier}</p>
          )}
        </div>

        {/* ── Password ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <button
              type="button"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border-2 bg-slate-50 px-4 py-1 transition-all duration-200
            ${errors.password
              ? "border-red-400 bg-red-50/60"
              : "border-slate-200 focus-within:border-brand-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]"
            }`}>
            <FaLock className="text-slate-400 text-sm flex-shrink-0" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••"
              autoComplete="current-password"
              className="flex-1 bg-transparent py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.password}</p>
          )}
        </div>

        {/* ── Toggle Remember Me ── */}
        <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
          <button
            type="button"
            role="switch"
            aria-checked={formData.rememberMe}
            onClick={() => setFormData((p) => ({ ...p, rememberMe: !p.rememberMe }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
              formData.rememberMe ? "bg-brand-600" : "bg-slate-200"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              formData.rememberMe ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
          <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
            Keep me signed in
          </span>
        </label>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={authBusy}
          className="group relative w-full flex items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-brand-600/20 transition-all duration-200 hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {authBusy ? (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <FaArrowRight className="text-sm opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-slate-500 pt-1">
          Need an account? Contact your hospital administrator to request access.
        </p>
      </form>

      {/* ── Security badge ── */}
      <div className="mt-10 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <span className="text-brand-600 text-sm">🔒</span>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-700">Secure Session</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Protected by HttpOnly cookies · No JWT in localStorage</p>
        </div>
      </div>

    </AuthLayout>
  );
}
