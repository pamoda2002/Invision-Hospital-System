/**
 * Opens a clean print window with just the report content —
 * no sidebar, topbar, filters or browser chrome.
 */
export const printFormalReport = ({ title, subtitle, periodLabel, bodyHtml }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #111;
      background: #fff;
      padding: 24px 32px;
    }

    /* ── Hospital header ── */
    .report-header {
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .report-header .hospital-name {
      font-size: 20px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .report-header .hospital-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    .report-header .meta {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      line-height: 1.7;
    }

    /* ── Report title block ── */
    .report-title-block {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 0 8px 8px 0;
    }
    .report-title-block h1 {
      font-size: 16px;
      font-weight: 800;
      color: #1e3a8a;
    }
    .report-title-block p {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }

    /* ── Stats grid ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #f8fafc;
    }
    .stat-card .stat-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .stat-card .stat-value {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1;
    }
    .stat-card .stat-sub {
      font-size: 9px;
      color: #94a3b8;
      margin-top: 4px;
    }

    /* ── Section cards ── */
    .section-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      background: #fff;
      page-break-inside: avoid;
    }
    .section-card h3 {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
    }

    /* ── Tables ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 16px;
    }
    thead tr {
      background: #1e3a8a;
      color: #fff;
    }
    thead th {
      padding: 7px 10px;
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    tbody tr:nth-child(even) { background: #f8fafc; }
    tbody tr:hover { background: #eff6ff; }
    tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    /* Status badges */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 9px;
      font-weight: 700;
    }
    .badge-green  { background:#dcfce7; color:#166534; }
    .badge-yellow { background:#fef9c3; color:#854d0e; }
    .badge-red    { background:#fee2e2; color:#991b1b; }
    .badge-blue   { background:#dbeafe; color:#1e40af; }
    .badge-gray   { background:#f1f5f9; color:#475569; }

    /* Progress bars */
    .progress-row { margin-bottom: 8px; }
    .progress-label { display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px; }
    .progress-track { height:6px; background:#e2e8f0; border-radius:999px; overflow:hidden; }
    .progress-fill  { height:100%; background:#2563eb; border-radius:999px; }

    /* ── Footer ── */
    .report-footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }

    @media print {
      body { padding: 0; }
      @page { margin: 12mm 14mm; }
    }
  </style>
</head>
<body>

  <!-- Hospital Header -->
  <div class="report-header">
    <div>
      <div class="hospital-name">Invision Hospital Management System</div>
      <div class="hospital-sub">Official Report — Confidential</div>
    </div>
    <div class="meta">
      <div>${dateStr}</div>
      <div>Generated at ${timeStr}</div>
    </div>
  </div>

  <!-- Report title block -->
  <div class="report-title-block">
    <h1>${title}</h1>
    <p>${subtitle} &nbsp;·&nbsp; ${periodLabel}</p>
  </div>

  <!-- Report body (extracted from DOM) -->
  ${bodyHtml}

  <!-- Footer -->
  <div class="report-footer">
    <span>Invision Hospital Management System &copy; ${now.getFullYear()}</span>
    <span>This report is auto-generated and is for internal use only.</span>
    <span>Page <span class="page-num"></span></span>
  </div>

  <script>
    window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; };
  </script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    alert("Popup blocked. Please allow popups for this site to print reports.");
    return;
  }
  w.document.write(html);
  w.document.close();
};

/**
 * Extracts clean printable HTML from the report body DOM node,
 * converting Tailwind classes to inline-friendly plain HTML.
 */
export const getPrintableHtml = (el) => {
  if (!el) return "<p>No data to print.</p>";

  const clone = el.cloneNode(true);

  // Remove elements that should not print
  clone.querySelectorAll(".no-print, button, [data-no-print]").forEach((n) => n.remove());

  // Convert stat cards
  clone.querySelectorAll("[class*='rounded-2xl'][class*='border'][class*='p-5']").forEach((card) => {
    const label = card.querySelector("[class*='text-gray-400']")?.textContent?.trim() || "";
    const value = card.querySelector("[class*='text-2xl']")?.textContent?.trim() || "—";
    const sub   = card.querySelector("[class*='text-xs'][class*='text-gray-400']:last-child")?.textContent?.trim() || "";
    card.outerHTML = `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ""}</div>`;
  });

  // Wrap stat cards in grid
  const html = clone.innerHTML
    .replace(/<div class="stat-card">/g, '<div class="stat-card">') // already transformed above
    .trim();

  return html;
};

export const formatPrintDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
