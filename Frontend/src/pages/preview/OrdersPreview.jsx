import { useState, useRef, useEffect } from "react";
import PageHeader from "../../components/PageHeader";

const DATE_RANGES = [
  { label: "Today",       value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "This month",  value: "month" },
  { label: "Last month",  value: "last_month" },
  { label: "All time",    value: "all" },
];

const SAMPLE = [
  { id: "ORD0042", customer: "Sarah Mitchell",  date: "30 May 2026", items: 3, total: 149.97, status: "Completed" },
  { id: "ORD0041", customer: "James Rodriguez", date: "29 May 2026", items: 1, total: 449.00, status: "Processing" },
  { id: "ORD0040", customer: "Priya Sharma",    date: "29 May 2026", items: 2, total: 84.98,  status: "Completed" },
  { id: "ORD0039", customer: "Alex Chen",       date: "27 May 2026", items: 4, total: 289.96, status: "Completed" },
  { id: "ORD0038", customer: "Emma Williams",   date: "26 May 2026", items: 1, total: 59.99,  status: "Pending" },
  { id: "ORD0037", customer: "Michael Brown",   date: "25 May 2026", items: 2, total: 162.98, status: "Completed" },
  { id: "ORD0036", customer: "Sarah Mitchell",  date: "24 May 2026", items: 1, total: 119.00, status: "Cancelled" },
  { id: "ORD0035", customer: "Alex Chen",       date: "23 May 2026", items: 5, total: 584.95, status: "Completed" },
  { id: "ORD0034", customer: "Liam O'Connor",   date: "22 May 2026", items: 2, total: 99.98,  status: "Processing" },
  { id: "ORD0033", customer: "Priya Sharma",    date: "21 May 2026", items: 3, total: 217.97, status: "Completed" },
];

const STATUS_CFG = {
  Completed:  { cls: "badge-success", label: "Completed" },
  Processing: { cls: "badge-info",    label: "Processing" },
  Pending:    { cls: "badge-warning", label: "Pending" },
  Cancelled:  { cls: "badge-danger",  label: "Cancelled" },
};

function SortIcon() {
  return (
    <span className="th-sort-icon">
      <svg viewBox="0 0 7 4" fill="currentColor"><path d="M3.5 0L7 4H0z"/></svg>
      <svg viewBox="0 0 7 4" fill="currentColor"><path d="M3.5 4L0 0h7z"/></svg>
    </span>
  );
}

export default function OrdersPreview() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [dateOpen, setDateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const dateRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeDateLabel = DATE_RANGES.find((r) => r.value === dateRange)?.label || "This month";
  const filtered = SAMPLE.filter((o) => {
    const matchSearch = [o.id, o.customer].some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = SAMPLE.reduce((s, o) => s + o.total, 0);
  const statusCounts = SAMPLE.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  const summary = [
    { label: "Total Orders",     value: SAMPLE.length,                bg: "var(--brand-50)",   text: "var(--brand-700)",   icon: "📋" },
    { label: "Total Revenue",    value: `₹${totalRevenue.toFixed(2)}`, bg: "var(--success-50)", text: "var(--success-700)", icon: "💰" },
    { label: "Avg. Order Value", value: `₹${(totalRevenue / SAMPLE.length).toFixed(2)}`, bg: "var(--warning-50)", text: "var(--warning-700)", icon: "📊" },
    { label: "Completed",        value: statusCounts.Completed || 0,  bg: "var(--success-50)", text: "var(--success-700)", icon: "✅" },
  ];

  return (
    <div className="page-container page-enter">
      <PageHeader title="Orders" subtitle="10 orders shown — sample data" actions={
        <button className="btn btn-primary">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Order
        </button>
      } />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {summary.map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius-lg)", padding: "16px 20px", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.text, letterSpacing: "-0.5px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="surface">
        <div className="table-toolbar">
          <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input className="form-input" style={{ paddingLeft: 32, height: 34 }} placeholder="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div ref={dateRef} style={{ position: "relative" }}>
              <button className="toolbar-chip" onClick={() => setDateOpen((o) => !o)} style={{ cursor: "pointer" }}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                {activeDateLabel}
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 11, height: 11 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {dateOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100, minWidth: 160 }}>
                  {DATE_RANGES.map((r) => (
                    <button key={r.value} onClick={() => { setDateRange(r.value); setDateOpen(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: 13, border: "none", background: dateRange === r.value ? "var(--brand-50)" : "transparent", color: dateRange === r.value ? "var(--brand-700)" : "var(--text-primary)", fontWeight: dateRange === r.value ? 600 : 400, cursor: "pointer" }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div ref={statusRef} style={{ position: "relative" }}>
              <button className="toolbar-chip" onClick={() => setStatusOpen((o) => !o)} style={{ cursor: "pointer" }}>
                {statusFilter === "All" ? "All Status" : statusFilter}
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 11, height: 11 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {statusOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100, minWidth: 150 }}>
                  {["All", "Completed", "Processing", "Pending", "Cancelled"].map((s) => (
                    <button key={s} onClick={() => { setStatusFilter(s); setStatusOpen(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: 13, border: "none", background: statusFilter === s ? "var(--brand-50)" : "transparent", color: statusFilter === s ? "var(--brand-700)" : "var(--text-primary)", fontWeight: statusFilter === s ? 600 : 400, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="toolbar-chip" style={{ background: "var(--brand-600)", color: "#fff", border: "1px solid var(--brand-600)", cursor: "pointer" }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Export
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th><span className="th-sort">Order ID <SortIcon /></span></th>
                <th><span className="th-sort">Customer <SortIcon /></span></th>
                <th><span className="th-sort">Date <SortIcon /></span></th>
                <th>Items</th>
                <th><span className="th-sort">Total <SortIcon /></span></th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const { cls, label } = STATUS_CFG[o.status] || STATUS_CFG.Pending;
                return (
                  <tr key={o.id}>
                    <td><span className="cell-id">{o.id}</span></td>
                    <td className="cell-primary">{o.customer}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{o.date}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{o.items} {o.items === 1 ? "item" : "items"}</td>
                    <td><strong style={{ color: "var(--brand-600)" }}>₹{o.total.toFixed(2)}</strong></td>
                    <td><span className={`badge ${cls}`}><span className="badge-dot" />{label}</span></td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-secondary btn-sm">View</button>
                        <button className="icon-btn" style={{ width: 28, height: 28 }}>
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">Showing 1-{filtered.length} of {SAMPLE.length} orders</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled>&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">&rsaquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
