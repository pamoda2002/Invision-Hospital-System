import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar.jsx";
import TopBar  from "../../../components/TopBar.jsx";
import { getPrintableHtml, printFormalReport } from "../../../utils/printReport.js";

/* ── Shared stat card ────────────────────────────────── */
export function StatCard({ label, value, sub, icon, color = "blue" }) {
  const COLORS = {
    blue:   "bg-blue-50 text-blue-600 border-blue-100",
    green:  "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber:  "bg-amber-50 text-amber-600 border-amber-100",
    red:    "bg-red-50 text-red-600 border-red-100",
    pink:   "bg-pink-50 text-pink-600 border-pink-100",
    sky:    "bg-sky-50 text-sky-600 border-sky-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-start gap-4 bg-white shadow-card ${COLORS[color] ? "border-gray-100" : "border-gray-100"}`}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${COLORS[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-none">{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Breakdown table (label → value) ─────────────────── */
export function BreakdownTable({ title, data, labelKey = "_id", valueKey = "count", accent = "#3b82f6" }) {
  if (!data || data.length === 0) return null;
  const entries = Array.isArray(data)
    ? data.map((d) => [d[labelKey] ?? d.label ?? "Unknown", d[valueKey] ?? d.value ?? 0])
    : Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{title}</h3>
      <div className="space-y-2">
        {entries.sort((a, b) => b[1] - a[1]).map(([label, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 capitalize">{label || "Unknown"}</span>
                <span className="font-bold text-gray-900">{count} <span className="text-xs text-gray-400 font-normal">({pct}%)</span></span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Monthly trend mini-chart (bar) ──────────────────── */
export function MonthlyChart({ title, data, field = "count", accent = "#3b82f6" }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d[field] || 0), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">{title}</h3>
      <div className="flex items-end gap-2 h-28">
        {data.map((d) => {
          const val = d[field] || 0;
          const pct = Math.round((val / max) * 100);
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{val}</span>
              <div className="w-full rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${Math.max(pct, 4)}%`, background: accent, minHeight: "4px" }} />
              <span className="text-[8px] text-gray-400 truncate w-full text-center">
                {d.month?.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Filter bar ──────────────────────────────────────── */
export function FilterBar({ startDate, endDate, onStartDate, onEndDate, onApply, onReset, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">From</label>
        <input type="date" value={startDate} onChange={(e) => onStartDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">To</label>
        <input type="date" value={endDate} onChange={(e) => onEndDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
      </div>
      <button onClick={onApply} disabled={loading}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-60 transition-colors">
        {loading ? "Loading…" : "Apply"}
      </button>
      {(startDate || endDate) && (
        <button onClick={onReset}
          className="px-4 py-2 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
          Clear
        </button>
      )}
    </div>
  );
}

/* ── Print / Export buttons ──────────────────────────── */
export function ReportActions({ onPrint, title }) {
  return (
    <div className="no-print flex items-center gap-2">
      <button onClick={onPrint}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v4H6v-4zm9-4a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd"/>
        </svg>
        Print
      </button>
    </div>
  );
}

function formatPrintDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

/* ── Top-level wrapper used by each report page ──────── */
export default function ReportPage({
  title, subtitle, icon, accent = "#3b82f6",
  startDate, endDate, onStartDate, onEndDate, onApply, onReset,
  loading, error, children,
}) {
  const navigate = useNavigate();
  const bodyRef = useRef(null);

  const periodLabel = startDate || endDate
    ? `Period: ${formatPrintDate(startDate) || "—"} to ${formatPrintDate(endDate) || "—"}`
    : "Period: All dates";

  const handlePrint = () => {
    printFormalReport({
      title,
      subtitle,
      periodLabel,
      bodyHtml: getPrintableHtml(bodyRef.current),
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-8 space-y-5">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Screen header */}
            <div className="no-print flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: `${accent}22` }}>
                  {icon}
                </div>
                <div>
                  <button onClick={() => navigate("/admin/reports")}
                    className="text-xs font-bold text-blue-500 hover:text-blue-700 mb-0.5 block">
                    ← All Reports
                  </button>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
                  <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
                </div>
              </div>
              <ReportActions onPrint={handlePrint} title={title} />
            </div>

            {/* Filter */}
            <div className="no-print">
              <FilterBar
                startDate={startDate} endDate={endDate}
                onStartDate={onStartDate} onEndDate={onEndDate}
                onApply={onApply} onReset={onReset} loading={loading}
              />
            </div>

            {error && (
              <div className="no-print bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div ref={bodyRef} className="print-report-body space-y-5">
                {children}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
