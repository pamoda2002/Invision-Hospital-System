import { FaHospital, FaUserDoctor, FaFlask, FaShieldHeart } from "react-icons/fa6";

const FEATURES = [
  { icon: <FaUserDoctor />, title: "Doctor Workflows",    desc: "Appointments, records & prescriptions" },
  { icon: <FaFlask />,      title: "Lab & Pharmacy",      desc: "Integrated diagnostics & medicines"    },
  { icon: <FaShieldHeart />,title: "Secure & Audited",    desc: "Role-based HttpOnly sessions"          },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex overflow-hidden">

      {/* ═══════════════════════════════════════════════════
          LEFT PANEL
          Structure: blue text column + white photo column
      ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[56%] min-h-screen overflow-hidden">

        {/* ── Blue text column ── */}
        <div
          className="flex flex-col flex-1 relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0a1628 0%, #0d1f5c 40%, #1a3a8f 75%, #1e4fc2 100%)",
          }}
        >
          {/* Dot-grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/25 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-indigo-800/40 rounded-full blur-[70px] pointer-events-none" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3 px-8 pt-8 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center shadow-lg">
              <FaHospital className="text-white text-lg" />
            </div>
            <div>
              <p className="text-white font-black text-base tracking-tight leading-none">Invision HMS</p>
              <p className="text-white/40 text-[9px] uppercase tracking-[0.3em] mt-0.5">Hospital Management System</p>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pb-10 space-y-8">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 self-start bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80 text-[11px] font-semibold tracking-wide">
                Staff Portal — Live
              </span>
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-4xl font-black leading-[1.08] text-white tracking-tight">
                Where healthcare<br />meets technology
              </h2>
              <p className="mt-3.5 text-[13px] leading-relaxed text-white/50 max-w-[260px]">
                A unified hospital system — patient records, lab, pharmacy, and scheduling in one secure workspace.
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-4">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-blue-300 text-sm flex-shrink-0">
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-white text-[13px] font-bold leading-none">{f.title}</p>
                    <p className="text-white/40 text-[11px] mt-0.5">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              {[
                { value: "6+",   label: "Roles" },
                { value: "100%", label: "Secure" },
                { value: "24/7", label: "Uptime" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="relative z-10 px-8 py-3 border-t border-white/[0.06]">
            <p className="text-white/20 text-[10px]">© 2026 Invision Hospital Management System</p>
          </div>
        </div>

        {/* ── White photo column — full height ── */}
        <div
          className="w-[220px] xl:w-[240px] flex-shrink-0 relative flex flex-col items-center justify-end overflow-hidden"
          style={{ background: "linear-gradient(180deg, #f0f6ff 0%, #ffffff 30%)" }}
        >
          {/* Very soft blue tint at the very top to blend with blue panel */}
          <div
            className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(219,234,254,0.9) 0%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Decorative vertical line connecting panels */}
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-100 to-transparent opacity-60" />

          {/* Doctor photo — fills the column height */}
          <img
            src="/doctor.jfif"
            alt="Medical professional"
            className="relative w-full h-full object-cover object-top select-none"
            style={{ maxHeight: "100%", objectPosition: "center top" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.querySelector(".doctor-fallback").style.display = "flex";
            }}
          />

          {/* SVG Fallback */}
          <div
            className="doctor-fallback hidden w-full h-full items-end justify-center pb-8"
            style={{ background: "#f8faff" }}
          >
            <svg viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40">
              <rect x="30" y="110" width="100" height="160" rx="20" fill="#e0e7ff"/>
              <circle cx="80" cy="80" r="34" fill="#fde68a"/>
              <ellipse cx="80" cy="52" rx="34" ry="18" fill="#78350f"/>
              <path d="M65 130 Q56 152 60 168 Q65 184 75 184" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <circle cx="75" cy="188" r="7" fill="#1e3a8a"/>
              <circle cx="70" cy="78" r="4" fill="#1e3a8a"/>
              <circle cx="90" cy="78" r="4" fill="#1e3a8a"/>
              <path d="M69 93 Q80 103 91 93" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT PANEL — login form
      ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen bg-white border-l border-gray-100">

        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow">
            <FaHospital className="text-white text-base" />
          </div>
          <div>
            <p className="font-black text-brand-800 text-sm tracking-tight">Invision HMS</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Hospital Management</p>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center lg:hidden">
          <p className="text-[11px] text-slate-400">© 2026 Invision HMS · All rights reserved</p>
        </div>
      </div>

    </div>
  );
}
