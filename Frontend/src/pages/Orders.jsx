import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, createOrder, deleteOrder } from "../services/orderService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";

/* ─── Toast ─── */
function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <svg className="toast-icon" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {t.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            )}
          </svg>
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="confirm-title">Cancel Order?</div>
        <div className="confirm-body">{message}</div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Keep</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Create Order Modal ─── */
function CreateOrderModal({ customers, products, onSave, onClose }) {
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const addLine = () => setLines((l) => [...l, { product_id: "", quantity: 1 }]);

  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));

  const updateLine = (i, field, value) =>
    setLines((l) => l.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  // Calculate estimated total from selected products
  const estimatedTotal = lines.reduce((sum, line) => {
    const product = products.find((p) => String(p.id) === String(line.product_id));
    return sum + (product ? product.price * (parseInt(line.quantity) || 0) : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!customerId) { setErr("Please select a customer."); return; }
    if (lines.some((l) => !l.product_id)) { setErr("Please select a product for each line."); return; }
    if (lines.some((l) => parseInt(l.quantity) < 1)) { setErr("Quantity must be at least 1."); return; }

    setSaving(true);
    try {
      const payload = {
        customer_id: parseInt(customerId),
        items: lines.map((l) => ({
          product_id: parseInt(l.product_id),
          quantity: parseInt(l.quantity),
        })),
      };
      await createOrder(payload);
      onSave();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to create order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div className="modal-title">Create New Order</div>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && (
              <div style={{ padding: "10px 14px", background: "var(--danger-50)", color: "var(--danger-600)", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                ⚠️ {err}
              </div>
            )}

            {/* Customer */}
            <div className="form-group">
              <label className="form-label" htmlFor="order-customer">Customer *</label>
              <select
                id="order-customer"
                className="form-input"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                style={{ cursor: "pointer" }}
              >
                <option value="">— Select a customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            {/* Order Lines */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Products *</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 12, height: 12 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Line
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lines.map((line, i) => {
                  const selectedProduct = products.find((p) => String(p.id) === String(line.product_id));
                  const stockOk = !selectedProduct || selectedProduct.quantity >= (parseInt(line.quantity) || 0);
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px auto", gap: 8, alignItems: "center" }}>
                      <select
                        className="form-input"
                        value={line.product_id}
                        onChange={(e) => updateLine(i, "product_id", e.target.value)}
                        required
                        style={{ cursor: "pointer", borderColor: selectedProduct && !stockOk ? "var(--danger-500)" : undefined }}
                      >
                        <option value="">— Select product —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} — ${p.price.toFixed(2)} (stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max={selectedProduct?.quantity || 9999}
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", e.target.value)}
                        required
                        style={{ borderColor: !stockOk ? "var(--danger-500)" : undefined }}
                      />
                      {lines.length > 1 && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeLine(i)}
                          style={{ color: "var(--danger-500)", padding: "0 6px" }}>
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15, height: 15 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stock warnings */}
              {lines.map((line, i) => {
                const p = products.find((pr) => String(pr.id) === String(line.product_id));
                if (p && parseInt(line.quantity) > p.quantity) {
                  return (
                    <div key={`warn-${i}`} style={{ fontSize: 12, color: "var(--danger-600)", marginTop: 4 }}>
                      ⚠️ {p.name}: only {p.quantity} in stock
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Estimated total */}
            {estimatedTotal > 0 && (
              <div style={{
                padding: "12px 16px",
                background: "var(--brand-50)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--brand-100)",
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand-700)" }}>Estimated Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-600)" }}>
                  ${estimatedTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="create-order-btn">
              {saving ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating…</>
              ) : (
                <>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function getStatus(id) {
  const statuses = ["completed", "processing", "pending", "cancelled"];
  return statuses[id % statuses.length];
}

function StatusBadge({ status }) {
  const cfg = {
    completed:  { cls: "badge-success", label: "Completed" },
    processing: { cls: "badge-info",    label: "Processing" },
    pending:    { cls: "badge-warning", label: "Pending" },
    cancelled:  { cls: "badge-danger",  label: "Cancelled" },
  };
  const { cls, label } = cfg[status] || cfg.pending;
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

/* ─── Main Page ─── */
function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(Array.isArray(o.data) ? o.data : []);
        setCustomers(Array.isArray(c.data) ? c.data : []);
        setProducts(Array.isArray(p.data) ? p.data : []);
      })
      .catch(() => addToast("Failed to load data", "danger"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOrderCreated = () => {
    setShowCreate(false);
    addToast("Order created! Stock has been updated.");
    load();
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(toDelete.id);
      addToast(`Order #${toDelete.id} deleted`);
      load();
    } catch {
      addToast("Failed to delete order", "danger");
    } finally {
      setToDelete(null);
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const filtered = safeOrders.filter((o) =>
    String(o.id).includes(search) ||
    String(o.customer_id).includes(search)
  );

  const totalRevenue = safeOrders.reduce((s, o) => s + (o.total_amount || 0), 0);

  const getCustomerName = (id) => {
    const c = customers.find((c) => c.id === id);
    return c ? c.full_name : `Customer #${id}`;
  };

  return (
    <div className="page-container page-enter">
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Orders",     value: safeOrders.length,            icon: "📋", color: "var(--brand-50)",   text: "var(--brand-700)"   },
          { label: "Total Revenue",    value: `$${totalRevenue.toFixed(2)}`, icon: "💰", color: "var(--success-50)", text: "var(--success-700)" },
          { label: "Avg. Order Value", value: safeOrders.length ? `$${(totalRevenue / safeOrders.length).toFixed(2)}` : "$0.00", icon: "📊", color: "var(--warning-50)", text: "var(--warning-700)" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.color, borderRadius: "var(--radius-lg)", padding: "16px 20px", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.text, letterSpacing: "-0.5px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Orders</h1>
          <p>{safeOrders.length} total orders • stock auto-updated on creation</p>
        </div>
        <button id="create-order-open-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Order
        </button>
      </div>

      {/* Table */}
      <div className="surface">
        <div className="surface-header">
          <div>
            <div className="surface-title">All Orders</div>
            <div className="surface-subtitle">{filtered.length} of {safeOrders.length} shown</div>
          </div>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              id="order-search"
              className="form-input"
              style={{ paddingLeft: 32, width: 220, height: 34 }}
              placeholder="Search by ID or customer ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrapper">
              <div className="spinner" />
              <span>Loading orders…</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="table-empty">
                        <svg className="table-empty-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <h3>{search ? "No matching orders" : "No orders yet"}</h3>
                        <p>{search ? "Try a different search" : "Click 'Create Order' to place your first order"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id}>
                      <td><span className="badge badge-gray">#{o.id}</span></td>
                      <td className="cell-primary">{getCustomerName(o.customer_id)}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {o.items?.length ?? 0} {(o.items?.length ?? 0) === 1 ? "item" : "items"}
                      </td>
                      <td><strong style={{ color: "var(--brand-600)" }}>${o.total_amount?.toFixed(2) ?? "0.00"}</strong></td>
                      <td><StatusBadge status={getStatus(o.id)} /></td>
                      <td>
                        <div className="cell-actions">
                          <Link to={`/orders/${o.id}`} className="btn btn-secondary btn-sm" id={`view-order-${o.id}`}>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </Link>
                          <button className="btn btn-danger btn-sm" onClick={() => setToDelete(o)} id={`delete-order-${o.id}`}>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreate && (
        <CreateOrderModal
          customers={Array.isArray(customers) ? customers : []}
          products={Array.isArray(products) ? products : []}
          onSave={handleOrderCreated}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Delete Confirm */}
      {toDelete && (
        <ConfirmDialog
          message={`Delete order #${toDelete.id} worth $${toDelete.total_amount?.toFixed(2)}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

export default Orders;