import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, createOrder, deleteOrder } from "../services/orderService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import { useToasts } from "../hooks/useToasts";
import { Toasts } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import { usePreview } from "../hooks/usePreview";
import OrdersPreview from "./preview/OrdersPreview";

const PAGE_SIZE = 8;
const fmtId = (id) => `#${String(id).padStart(4, "0")}`;
const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

function CreateOrderModal({ customers, products, onSave, onClose }) {
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const addLine = () => setLines((l) => [...l, { product_id: "", quantity: 1 }]);
  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, value) =>
    setLines((l) => l.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  const blockQtyKey = (e) => {
    if (["e", "E", "-", "."].includes(e.key)) e.preventDefault();
  };

  const findProduct = (id) => products.find((p) => String(p.id) === String(id));

  const estimatedTotal = lines.reduce((sum, line) => {
    const product = findProduct(line.product_id);
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
            {err && <div className="form-error">{err}</div>}

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
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

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
                  const selected = findProduct(line.product_id);
                  const stockOk = !selected || selected.quantity >= (parseInt(line.quantity) || 0);
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px auto", gap: 8, alignItems: "center" }}>
                      <select
                        className="form-input"
                        value={line.product_id}
                        onChange={(e) => updateLine(i, "product_id", e.target.value)}
                        required
                        style={{ cursor: "pointer", borderColor: selected && !stockOk ? "var(--danger-500)" : undefined }}
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} - ₹{p.price.toFixed(2)} (stock: {p.quantity})
                          </option>
                        ))}
                      </select>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max={selected?.quantity || 9999}
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", e.target.value)}
                        onKeyDown={blockQtyKey}
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

              {lines.map((line, i) => {
                const p = findProduct(line.product_id);
                if (p && parseInt(line.quantity) > p.quantity) {
                  return (
                    <div key={`warn-${i}`} style={{ fontSize: 12, color: "var(--danger-600)", marginTop: 4 }}>
                      {p.name}: only {p.quantity} in stock
                    </div>
                  );
                }
                return null;
              })}
            </div>

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
                  ₹{estimatedTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="create-order-btn">
              {saving ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating</>
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

function OrdersLive() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const { toasts, notify } = useToasts();

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o.data);
        setCustomers(c.data);
        setProducts(p.data);
      })
      .catch(() => notify("Failed to load data", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        if (cancelled) return;
        setOrders(o.data);
        setCustomers(c.data);
        setProducts(p.data);
      })
      .catch(() => { if (!cancelled) notify("Failed to load data", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [notify]);

  const handleOrderCreated = () => {
    setShowCreate(false);
    notify("Order created, stock updated");
    load();
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(toDelete.id);
      notify(`Order #${toDelete.id} deleted, stock restored`);
      load();
    } catch (e) {
      notify(e?.response?.data?.detail || "Failed to delete order", "error");
    } finally {
      setToDelete(null);
    }
  };

  const getCustomerName = (id) => {
    const c = customers.find((c) => c.id === id);
    return c ? c.full_name : `Customer #${id}`;
  };

  const filtered = orders.filter((o) => {
    const matchSearch = String(o.id).includes(search) || String(o.customer_id).includes(search) ||
      getCustomerName(o.customer_id).toLowerCase().includes(search.toLowerCase());
    const orderDate = o.created_at ? new Date(o.created_at) : null;
    const matchFrom = !dateFrom || (orderDate && orderDate >= new Date(dateFrom));
    const matchTo = !dateTo || (orderDate && orderDate <= new Date(dateTo + "T23:59:59"));
    return matchSearch && matchFrom && matchTo;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

  const summary = [
    { label: "Total Orders", value: orders.length, icon: "📋", bg: "var(--brand-50)", text: "var(--brand-700)" },
    { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: "💰", bg: "var(--success-50)", text: "var(--success-700)" },
    { label: "Avg. Order Value", value: orders.length ? `₹${(totalRevenue / orders.length).toFixed(2)}` : "₹0.00", icon: "📊", bg: "var(--warning-50)", text: "var(--warning-700)" },
  ];

  return (
    <div className="page-container page-enter">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders, stock auto-updated on creation`}
        actions={
          <button id="create-order-open-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Order
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {summary.map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius-lg)", padding: "16px 20px", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.text, letterSpacing: "-0.5px" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="surface">
        <div className="surface-header">
          <div>
            <div className="surface-title">All Orders</div>
            <div className="surface-subtitle">{filtered.length} of {orders.length} shown</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
              <input
                id="order-search"
                className="form-input"
                style={{ paddingLeft: 32, width: 200, height: 34 }}
                placeholder="Search orders"
                value={search}
                onChange={onSearch}
              />
            </div>
            <input
              type="date"
              className="form-input"
              style={{ height: 34, width: 148, fontSize: 13, cursor: "pointer" }}
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>to</span>
            <input
              type="date"
              className="form-input"
              style={{ height: 34, width: 148, fontSize: 13, cursor: "pointer" }}
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
            {(dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm" style={{ height: 34, color: "var(--text-tertiary)" }}
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrapper">
              <div className="spinner" />
              <span>Loading orders</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
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
                  paged.map((o) => (
                    <tr key={o.id}>
                      <td><span className="cell-id">{fmtId(o.id)}</span></td>
                      <td className="cell-primary">{getCustomerName(o.customer_id)}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{fmtDate(o.created_at)}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {o.items?.length ?? 0} {(o.items?.length ?? 0) === 1 ? "item" : "items"}
                      </td>
                      <td><strong style={{ color: "var(--brand-600)" }}>₹{o.total_amount?.toFixed(2) ?? "0.00"}</strong></td>
                      <td><span className="badge badge-success"><span className="badge-dot" />Confirmed</span></td>
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

        {!loading && filtered.length > 0 && (
          <Pagination page={safePage} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
        )}
      </div>

      {showCreate && (
        <CreateOrderModal
          customers={customers}
          products={products}
          onSave={handleOrderCreated}
          onClose={() => setShowCreate(false)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Cancel Order?"
          message={`Delete order #${toDelete.id} worth ₹${toDelete.total_amount?.toFixed(2)}? Stock will be restored. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}

function Orders() {
  const { preview } = usePreview();
  return preview ? <OrdersPreview /> : <OrdersLive />;
}

export default Orders;
