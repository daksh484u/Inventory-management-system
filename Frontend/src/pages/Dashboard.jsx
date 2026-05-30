import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getCustomers } from "../services/customerService";
import { getOrders } from "../services/orderService";
import DashboardPreview from "./DashboardPreview";
import { usePreview } from "../hooks/usePreview";

const LOW_STOCK_THRESHOLD = 10;

const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

function StatCard({ label, value, hint, iconClass, icon, color, to }) {
  const navigate = useNavigate();
  return (
    <div
      className="stat-card"
      style={{ "--card-tint": color + "18", cursor: to ? "pointer" : "default" }}
      onClick={() => to && navigate(to)}
      title={to ? `Go to ${label}` : undefined}
    >
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
      {to && (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={color} style={{ width: 15, height: 15, opacity: 0.5, marginLeft: "auto", alignSelf: "center", flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      )}
    </div>
  );
}

function StockRow({ name, sku, qty }) {
  const pct = Math.min(100, Math.round((qty / 20) * 100));
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

function DashboardLive() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => {
        setProducts(p.data);
        setCustomers(c.data);
        setOrders(o.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const lowStock = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);
  const recentOrders = orders.slice(0, 5);

  // Real inventory health, derived from current stock levels.
  const outCount = products.filter((p) => p.quantity === 0).length;
  const lowCount = products.filter((p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD).length;
  const healthyCount = products.filter((p) => p.quantity > LOW_STOCK_THRESHOLD).length;
  const totalProducts = products.length || 1;
  const health = [
    { label: "Healthy", count: healthyCount, color: "var(--success-500)" },
    { label: "Low", count: lowCount, color: "var(--warning-500)" },
    { label: "Out", count: outCount, color: "var(--danger-500)" },
  ];

  const customerName = (id) => {
    const c = customers.find((c) => c.id === id);
    return c ? c.full_name : `Customer #${id}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-wrapper">
          <div className="spinner" />
          <span>Loading dashboard</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-enter">
      <div className="stats-grid">
        <StatCard
          label="Total Products"
          value={products.length}
          hint={lowStock.length ? `${lowStock.length} low on stock` : "All well stocked"}
          iconClass="stat-icon-brand"
          color="#14b8a6"
          to="/products"
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
        />
        <StatCard
          label="Total Customers"
          value={customers.length}
          iconClass="stat-icon-blue"
          color="#3b82f6"
          to="/customers"
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          iconClass="stat-icon-green"
          color="#22c55e"
          to="/orders"
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint={`across ${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
          iconClass="stat-icon-yellow"
          color="#f59e0b"
          to="/orders"
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="dashboard-grid-3">
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
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="table-empty">
                        <p>No orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><span className="cell-id">#{String(o.id).padStart(4, "0")}</span></td>
                      <td><span className="cell-primary">{customerName(o.customer_id)}</span></td>
                      <td style={{ color: "var(--text-secondary)" }}>{fmtDate(o.created_at)}</td>
                      <td><strong>₹{o.total_amount?.toFixed(2) ?? "0.00"}</strong></td>
                      <td><span className="badge badge-success"><span className="badge-dot" />Confirmed</span></td>
                      <td><Link to={`/orders/${o.id}`} className="btn btn-ghost btn-sm">View</Link></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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

          {products.length > 0 && (
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", height: 8, borderRadius: "var(--radius-full)", overflow: "hidden", background: "var(--bg-muted)" }}>
                {health.map((h) => h.count > 0 && (
                  <div key={h.label} style={{ width: `${(h.count / totalProducts) * 100}%`, background: h.color }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                {health.map((h) => (
                  <div key={h.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: h.color }} />
                    {h.label} <strong style={{ color: "var(--text-primary)" }}>{h.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        <p style={{ color: "var(--success-600)", fontWeight: 600 }}>All well stocked</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lowStock.slice(0, 6).map((p) => (
                    <StockRow key={p.id} name={p.name} sku={p.sku} qty={p.quantity} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 8 }}>
            <Link to="/products" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Product
            </Link>
            <Link to="/customers" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
              Customers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { preview } = usePreview();
  return preview ? (
    <div className="page-container page-enter">
      <DashboardPreview />
    </div>
  ) : <DashboardLive />;
}

export default Dashboard;
