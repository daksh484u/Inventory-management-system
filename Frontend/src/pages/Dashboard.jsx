import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getCustomers } from "../services/customerService";
import { getOrders } from "../services/orderService";

/* ─── Mini sparkline chart using inline SVG ─── */
function Sparkline({ values = [], color = "#6172f3" }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const polyline = points.join(" ");
  const area = `0,${h} ${polyline} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, delta, deltaUp, iconClass, icon, color, sparkData }) {
  return (
    <div className="stat-card" style={{ "--card-tint": color + "18" }}>
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-delta ${deltaUp ? "up" : "down"}`}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              d={deltaUp
                ? "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                : "M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941"
              }
            />
          </svg>
          {delta}
        </div>
      </div>
      {sparkData && (
        <div style={{ alignSelf: "center", marginLeft: "auto" }}>
          <Sparkline values={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}

/* ─── Low-stock Row ─── */
function StockRow({ name, sku, qty, max }) {
  const pct = Math.min(100, Math.round((qty / max) * 100));
  const barColor = pct <= 20 ? "var(--danger-500)" : pct <= 50 ? "var(--warning-500)" : "var(--success-500)";
  const badgeClass = pct <= 20 ? "badge-danger" : pct <= 50 ? "badge-warning" : "badge-success";
  return (
    <tr>
      <td>
        <div className="cell-primary">{name}</div>
        <div className="cell-mono">{sku}</div>
      </td>
      <td>
        <span className={`badge ${badgeClass}`}>
          <span className="badge-dot" />
          {qty} units
        </span>
      </td>
      <td style={{ width: 120 }}>
        <div className="stock-bar">
          <div className="stock-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{pct}%</div>
      </td>
    </tr>
  );
}

/* ─── Recent Order Row ─── */
function OrderRow({ order }) {
  return (
    <tr>
      <td><span className="cell-mono">#{order.id}</span></td>
      <td><span className="cell-primary">Customer #{order.customer_id}</span></td>
      <td><strong>${order.total_amount?.toFixed(2) ?? "0.00"}</strong></td>
      <td>
        <span className="badge badge-success">
          <span className="badge-dot" />
          Completed
        </span>
      </td>
      <td>
        <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View →</Link>
      </td>
    </tr>
  );
}

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => {
        setProducts(Array.isArray(p.data) ? p.data : []);
        setCustomers(Array.isArray(c.data) ? c.data : []);
        setOrders(Array.isArray(o.data) ? o.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Safe derived values — always operate on guaranteed arrays
  const safeOrders   = Array.isArray(orders)   ? orders   : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const totalRevenue = safeOrders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const lowStock = safeProducts.filter((p) => p.quantity <= 10);
  const recentOrders = [...safeOrders].reverse().slice(0, 5);

  // Sparkline data
  const revSpark = [420, 380, 510, 490, 620, 580, 710, totalRevenue / 100 || 750];
  const ordSpark = [8, 12, 7, 15, 11, 18, 14, safeOrders.length || 20];

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-wrapper">
          <div className="spinner" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-enter">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total Products"
          value={safeProducts.length}
          delta="+12% this month"
          deltaUp
          iconClass="stat-icon-brand"
          color="#6172f3"
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        />
        <StatCard
          label="Total Customers"
          value={Array.isArray(customers) ? customers.length : 0}
          delta="+8% this month"
          deltaUp
          iconClass="stat-icon-blue"
          color="#3b82f6"
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={safeOrders.length}
          delta="+24% this month"
          deltaUp
          iconClass="stat-icon-green"
          color="#22c55e"
          sparkData={ordSpark}
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delta="+18% this month"
          deltaUp
          iconClass="stat-icon-yellow"
          color="#f59e0b"
          sparkData={revSpark}
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Lower grid */}
      <div className="dashboard-grid-3">
        {/* Recent Orders table */}
        <div className="surface">
          <div className="surface-header">
            <div>
              <div className="surface-title">Recent Orders</div>
              <div className="surface-subtitle">Latest {recentOrders.length} orders</div>
            </div>
            <Link to="/orders" className="btn btn-secondary btn-sm">
              View all
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="table-empty">
                        <p>No orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => <OrderRow key={o.id} order={o} />)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock panel */}
        <div className="surface">
          <div className="surface-header">
            <div>
              <div className="surface-title">Low Stock Alert</div>
              <div className="surface-subtitle">{lowStock.length} products need attention</div>
            </div>
            {lowStock.length > 0 && (
              <span className="badge badge-danger">{lowStock.length}</span>
            )}
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="table-empty">
                        <p style={{ color: "var(--success-600)", fontWeight: 600 }}>✓ All well stocked</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lowStock.slice(0, 6).map((p) => (
                    <StockRow key={p.id} name={p.name} sku={p.sku} qty={p.quantity} max={20} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick links */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 8 }}>
            <Link to="/products" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Product
            </Link>
            <Link to="/customers" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
              Customers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;