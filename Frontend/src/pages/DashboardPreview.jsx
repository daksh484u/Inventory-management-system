import { useState } from "react";
import { AreaChart, DonutChart } from "../components/charts";

const RANGE_DATA = {
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    revenue: [3200, 4100, 3800, 5200, 4800, 6100, 6800],
    orders:  [18,   24,   21,   32,   28,   36,   41],
  },
  "30d": {
    labels: ["W1", "W2", "W3", "W4"],
    revenue: [28400, 31200, 29800, 38100],
    orders:  [164,   188,   172,   220],
  },
  "90d": {
    labels: ["Mar", "Apr", "May"],
    revenue: [82000, 91400, 98000],
    orders:  [480,   540,   580],
  },
  "1y": {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    revenue: [62000, 71000, 68000, 74000, 88000, 95000, 110000, 78000, 85000, 91000, 98000, 105000],
    orders:  [360,   420,   400,   440,   520,   560,   640,    460,   500,   540,   580,   620],
  },
};

const METRIC_OPTIONS = [
  { value: "both",    label: "Revenue & Orders" },
  { value: "revenue", label: "Revenue only" },
  { value: "orders",  label: "Orders only" },
];

const ORDER_STATUS = [
  { label: "Completed",  value: 845, color: "#22c55e" },
  { label: "Processing", value: 312, color: "#3b82f6" },
  { label: "Pending",    value: 198, color: "#f59e0b" },
  { label: "Cancelled",  value: 127, color: "#ef4444" },
];

const TOP_PRODUCTS = [
  { name: "Wireless Keyboard Pro",  sku: "KB-001",    sold: 482, rev: 24054, pct: 100 },
  { name: "USB-C Hub 7-in-1",       sku: "HUB-220",   sold: 391, rev: 13682, pct: 81  },
  { name: "Noise-Cancel Headset",   sku: "AUD-905",   sold: 318, rev: 41022, pct: 66  },
  { name: "27\" 4K Monitor",         sku: "MON-274",   sold: 254, rev: 114046, pct: 53 },
  { name: "Ergonomic Mouse",        sku: "MS-118",    sold: 201, rev: 12060, pct: 42  },
];

const CATEGORIES = [
  { name: "Electronics",  count: 412, color: "#14b8a6" },
  { name: "Peripherals",  count: 318, color: "#3b82f6" },
  { name: "Accessories",  count: 246, color: "#a855f7" },
  { name: "Cables",       count: 138, color: "#f59e0b" },
  { name: "Storage",      count: 90,  color: "#ef4444" },
];
const CAT_MAX = Math.max(...CATEGORIES.map((c) => c.count));

const RECENT_ORDERS = [
  { id: "ORD0042", customer: "Rahul Sharma",   date: "30 May", items: 3, total: 149.97, status: "Completed",  cls: "badge-success" },
  { id: "ORD0041", customer: "Priya Mehta",    date: "29 May", items: 1, total: 449.00, status: "Processing", cls: "badge-info"    },
  { id: "ORD0040", customer: "Arjun Kapoor",   date: "29 May", items: 2, total: 84.98,  status: "Completed",  cls: "badge-success" },
  { id: "ORD0039", customer: "Sneha Iyer",     date: "27 May", items: 4, total: 289.96, status: "Completed",  cls: "badge-success" },
  { id: "ORD0038", customer: "Vikram Singh",   date: "26 May", items: 1, total: 59.99,  status: "Pending",    cls: "badge-warning" },
];

const LOW_STOCK = [
  { name: "27\" 4K Monitor",      sku: "MON-274",   qty: 15, max: 100 },
  { name: "Noise-Cancel Headset", sku: "AUD-905",   qty: 23, max: 100 },
  { name: "Portable SSD 1TB",     sku: "SSD-P1T",   qty: 6,  max: 100 },
  { name: "Mechanical Keyboard",  sku: "KB-MEC-77", qty: 0,  max: 100 },
];

const STATS = [
  {
    label: "Total Revenue", value: "₹48,260", delta: "+18.2%", up: true,
    iconClass: "stat-icon-brand", color: "#14b8a6",
    path: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Total Orders", value: "1,482", delta: "+12.5%", up: true,
    iconClass: "stat-icon-green", color: "#22c55e",
    path: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  },
  {
    label: "Total Products", value: "1,204", delta: "+4.2%", up: true,
    iconClass: "stat-icon-blue", color: "#3b82f6",
    path: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  },
  {
    label: "Low Stock Items", value: "23", delta: "-6.1%", up: false,
    iconClass: "stat-icon-yellow", color: "#f59e0b",
    path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
];

function StatCard({ label, value, delta, up, iconClass, color, path }) {
  return (
    <div className="stat-card" style={{ "--card-tint": color + "18" }}>
      <div className={`stat-icon ${iconClass}`}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-delta ${up ? "up" : "down"}`}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={up ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
          </svg>
          {delta} this month
        </div>
      </div>
    </div>
  );
}

const RANGE_TABS = [
  { label: "7D",  value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y",  value: "1y" },
];

export default function DashboardPreview() {
  const [range, setRange] = useState("7d");
  const [metric, setMetric] = useState("both");
  const [metricOpen, setMetricOpen] = useState(false);

  const data = RANGE_DATA[range];
  const series = [];
  if (metric !== "orders")  series.push({ name: "Revenue", data: data.revenue, color: "#14b8a6" });
  if (metric !== "revenue") series.push({ name: "Orders",  data: data.orders,  color: "#3b82f6" });
  const activeMetricLabel = METRIC_OPTIONS.find((m) => m.value === metric)?.label;

  return (
    <>
      <div className="stats-grid">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Row 2: area chart + donut */}
      <div className="dashboard-grid-3" style={{ marginBottom: 16 }}>
        <div className="surface">
          <div className="surface-header">
            <div>
              <div className="surface-title">Sales Trend</div>
              <div className="surface-subtitle">
                {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : "Last 12 months"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Time range tabs */}
              <div style={{ display: "flex", background: "var(--bg-muted)", borderRadius: "var(--radius-md)", padding: 2, gap: 2 }}>
                {RANGE_TABS.map((t) => (
                  <button key={t.value} onClick={() => setRange(t.value)}
                    style={{
                      padding: "4px 10px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer",
                      background: range === t.value ? "var(--bg-surface)" : "transparent",
                      color: range === t.value ? "var(--brand-600)" : "var(--text-tertiary)",
                      boxShadow: range === t.value ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Metric dropdown */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setMetricOpen((o) => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 12, fontWeight: 500, border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", cursor: "pointer", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {activeMetricLabel}
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 10, height: 10 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {metricOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100, minWidth: 160 }}>
                    {METRIC_OPTIONS.map((o) => (
                      <button key={o.value} onClick={() => { setMetric(o.value); setMetricOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", fontSize: 13, border: "none", background: metric === o.value ? "var(--brand-50)" : "transparent", color: metric === o.value ? "var(--brand-700)" : "var(--text-primary)", fontWeight: metric === o.value ? 600 : 400, cursor: "pointer" }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ padding: "16px 20px 8px" }}>
            <AreaChart
              labels={data.labels}
              series={series}
              height={200}
            />
          </div>
          <div style={{ padding: "0 20px 14px", display: "flex", gap: 20 }}>
            {series.map((s) => (
              <span key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ width: 24, height: 3, borderRadius: 9, background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="surface">
          <div className="surface-header">
            <div className="surface-title">Orders by Status</div>
            <span className="badge badge-gray">This month</span>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <DonutChart segments={ORDER_STATUS} size={156} />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
              {ORDER_STATUS.map((s) => {
                const total = ORDER_STATUS.reduce((a, b) => a + b.value, 0);
                return (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />
                      {s.label}
                    </span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <strong>{s.value}</strong>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{Math.round((s.value / total) * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: recent orders + low stock */}
      <div className="dashboard-grid-3" style={{ marginBottom: 16 }}>
        <div className="surface">
          <div className="surface-header">
            <div>
              <div className="surface-title">Recent Orders</div>
              <div className="surface-subtitle">Latest 5 orders</div>
            </div>
            <span className="badge badge-brand">Live</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td><span className="cell-id">{o.id}</span></td>
                    <td className="cell-primary">{o.customer}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{o.date}</td>
                    <td><strong>₹{o.total.toFixed(2)}</strong></td>
                    <td><span className={`badge ${o.cls}`}><span className="badge-dot" />{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="surface">
            <div className="surface-header">
              <div className="surface-title">Low Stock Alert</div>
              <span className="badge badge-danger">{LOW_STOCK.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {LOW_STOCK.map((p) => {
                const pct = Math.round((p.qty / 30) * 100);
                return (
                  <div key={p.sku} style={{ padding: "10px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cell-primary" style={{ fontSize: 13 }}>{p.name}</div>
                      <div className="cell-mono">{p.sku}</div>
                    </div>
                    <div style={{ width: 80, textAlign: "right" }}>
                      {p.qty === 0
                        ? <span className="badge badge-danger"><span className="badge-dot" />Out</span>
                        : <span className="badge badge-warning"><span className="badge-dot" />{p.qty}</span>}
                    </div>
                    <div style={{ width: 60 }}>
                      <div className="stock-bar">
                        <div className="stock-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: p.qty === 0 ? "var(--danger-500)" : "var(--warning-500)" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: top products + categories */}
      <div className="dashboard-grid-3">
        <div className="surface">
          <div className="surface-header">
            <div>
              <div className="surface-title">Top Selling Products</div>
              <div className="surface-subtitle">By units sold this month</div>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Revenue</th>
                  <th style={{ width: 100 }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {TOP_PRODUCTS.map((p, i) => (
                  <tr key={p.sku}>
                    <td className="cell-mono" style={{ color: "var(--brand-600)", fontWeight: 700 }}>{i + 1}</td>
                    <td>
                      <div className="cell-primary">{p.name}</div>
                      <div className="cell-mono">{p.sku}</div>
                    </td>
                    <td><strong>{p.sold}</strong></td>
                    <td style={{ color: "var(--brand-600)", fontWeight: 600, fontSize: 13 }}>₹{p.rev.toLocaleString("en-IN")}</td>
                    <td>
                      <div className="stock-bar">
                        <div className="stock-bar-fill" style={{ width: `${p.pct}%`, background: "var(--brand-500)" }} />
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", marginTop: 2 }}>{p.pct}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface">
          <div className="surface-header">
            <div className="surface-title">Inventory by Category</div>
            <div className="surface-subtitle">Product distribution</div>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {CATEGORIES.map((c) => (
              <div key={c.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <strong>{c.count}</strong>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{Math.round((c.count / CAT_MAX) * 100)}%</span>
                  </span>
                </div>
                <div className="stock-bar" style={{ height: 8 }}>
                  <div className="stock-bar-fill" style={{ width: `${Math.round((c.count / CAT_MAX) * 100)}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
