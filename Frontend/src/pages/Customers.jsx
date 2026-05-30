import { useState, useEffect } from "react";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
} from "../services/customerService";

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
        <div className="confirm-title">Remove Customer</div>
        <div className="confirm-body">{message}</div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Customer Avatar ─── */
function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  // Consistent colour from name hash
  const colors = ["#6172f3", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: colors[idx], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ─── Add Customer Modal ─── */
const EMPTY = { full_name: "", email: "", phone: "" };

function CustomerModal({ onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      await createCustomer(form);
      onSave();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add New Customer</div>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && (
              <div style={{ padding: "10px 14px", background: "var(--danger-50)", color: "var(--danger-600)", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500 }}>
                {err}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="cust-name">Full Name *</label>
              <input id="cust-name" className="form-input" name="full_name" placeholder="e.g. Jane Smith" required value={form.full_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-email">Email Address *</label>
              <input id="cust-email" className="form-input" name="email" type="email" placeholder="jane@example.com" required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-phone">Phone Number *</label>
              <input id="cust-phone" className="form-input" name="phone" placeholder="+1 555 000 0000" required value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-customer-btn">
              {saving ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
              ) : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const load = () => {
    setLoading(true);
    getCustomers()
      .then((r) => setCustomers(Array.isArray(r.data) ? r.data : []))
      .catch(() => addToast("Failed to load customers", "danger"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = () => {
    setShowModal(false);
    addToast("Customer added!");
    load();
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(toDelete.id);
      addToast(`"${toDelete.full_name}" removed`);
      load();
    } catch {
      addToast("Failed to delete", "danger");
    } finally {
      setToDelete(null);
    }
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const filtered = safeCustomers.filter((c) =>
    [c.full_name, c.email, c.phone].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Customers</h1>
          <p>{safeCustomers.length} registered customers</p>
        </div>
        <button id="add-customer-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Customer
        </button>
      </div>

      <div className="surface">
        <div className="surface-header">
          <div>
            <div className="surface-title">Customer List</div>
            <div className="surface-subtitle">{filtered.length} of {safeCustomers.length} shown</div>
          </div>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              id="customer-search"
              className="form-input"
              style={{ paddingLeft: 32, width: 200, height: 34 }}
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrapper">
              <div className="spinner" />
              <span>Loading customers…</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="table-empty">
                        <svg className="table-empty-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <h3>{search ? "No matching customers" : "No customers yet"}</h3>
                        <p>{search ? "Try a different search" : "Add your first customer to get started"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td className="cell-mono">{i + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={c.full_name} />
                          <span className="cell-primary">{c.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{c.email}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{c.phone}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setToDelete(c)}
                          id={`delete-customer-${c.id}`}
                        >
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <CustomerModal onSave={handleSave} onClose={() => setShowModal(false)} />}

      {toDelete && (
        <ConfirmDialog
          message={`Remove "${toDelete.full_name}" (${toDelete.email}) from your customer list? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

export default Customers;