import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/orderService";

const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrderById(id)
      .then((r) => setOrder(r.data))
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-wrapper">
          <div className="spinner" />
          <span>Loading order</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container page-enter">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2 style={{ marginBottom: 8, color: "var(--text-secondary)" }}>Order not found</h2>
          <p style={{ color: "var(--text-tertiary)", marginBottom: 20 }}>
            Order #{id} doesn't exist or has been deleted.
          </p>
          <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="page-container page-enter">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "var(--text-secondary)" }}>
        <Link to="/orders" style={{ color: "var(--brand-600)", fontWeight: 500, textDecoration: "none" }}>
          Orders
        </Link>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span>Order #{id}</span>
      </div>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Order #{order.id}</h1>
          <p>Full details for this order</p>
        </div>
        <Link to="/orders" className="btn btn-secondary">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="surface">
          <div className="surface-header">
            <div className="surface-title">Order Items</div>
            <span className="badge badge-brand">{items.length} items</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="table-empty">
                        <p>No items recorded for this order</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-primary">{item.product_name || `Product #${item.product_id}`}</td>
                      <td>₹{item.unit_price?.toFixed(2)}</td>
                      <td><span className="badge badge-gray">x {item.quantity}</span></td>
                      <td><strong>₹{(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {items.length > 0 && (
            <div style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <div style={{ display: "flex", gap: 60, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                <span>Total</span>
                <span style={{ color: "var(--brand-600)" }}>₹{order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="surface">
            <div className="surface-header">
              <div className="surface-title">Order Summary</div>
            </div>
            <div className="surface-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SummaryRow label="Order ID" value={`#${String(order.id).padStart(4, "0")}`} />
              <SummaryRow label="Customer ID" value={`#${order.customer_id}`} />
              <SummaryRow label="Order Date" value={fmtDate(order.created_at)} />
              <SummaryRow label="Total Amount" value={`₹${order.total_amount?.toFixed(2)}`} bold />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Status</span>
                <span className="badge badge-success"><span className="badge-dot" />Confirmed</span>
              </div>
            </div>
          </div>

          <div className="surface">
            <div className="surface-header">
              <div className="surface-title">Quick Actions</div>
            </div>
            <div className="surface-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => window.print()}>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 15, height: 15 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                Print
              </button>
              <Link to="/orders" className="btn btn-primary" style={{ justifyContent: "center" }}>
                All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, color: bold ? "var(--brand-600)" : "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default OrderDetails;
