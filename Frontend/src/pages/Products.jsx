import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import { useToasts } from "../hooks/useToasts";
import { Toasts } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import { usePreview } from "../hooks/usePreview";
import ProductsPreview from "./preview/ProductsPreview";

const EMPTY = { name: "", sku: "", price: "", quantity: "" };
const PAGE_SIZE = 8;
const fmtId = (id) => `#${String(id).padStart(4, "0")}`;

function ProductModal({ product, onSave, onClose }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(
    product
      ? { name: product.name, sku: product.sku, price: product.price, quantity: product.quantity }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
      };
      if (isEdit) await updateProduct(product.id, payload);
      else await createProduct(payload);
      onSave();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit Product" : "Add New Product"}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {err && <div className="form-error">{err}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="prod-name">Product Name *</label>
              <input id="prod-name" className="form-input" name="name" placeholder="e.g. Wireless Keyboard" required value={form.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prod-sku">SKU *</label>
              <input id="prod-sku" className="form-input" name="sku" placeholder="e.g. KB-001" required value={form.sku} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-price">Price ($) *</label>
                <input id="prod-price" className="form-input" name="price" type="number" step="0.01" min="0.01" placeholder="0.00" required value={form.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-qty">Quantity *</label>
                <input id="prod-qty" className="form-input" name="quantity" type="number" min="0" placeholder="0" required value={form.quantity} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-product-btn">
              {saving ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Saving
                </>
              ) : (
                isEdit ? "Save Changes" : "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockBadge({ qty }) {
  if (qty === 0) return <span className="badge badge-danger"><span className="badge-dot" />Out of stock</span>;
  if (qty <= 5) return <span className="badge badge-danger"><span className="badge-dot" />{qty} left</span>;
  if (qty <= 20) return <span className="badge badge-warning"><span className="badge-dot" />{qty} low</span>;
  return <span className="badge badge-success"><span className="badge-dot" />{qty} in stock</span>;
}

function ProductsLive() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | "add" | product
  const [toDelete, setToDelete] = useState(null);
  const { toasts, notify } = useToasts();

  const load = () => {
    setLoading(true);
    getProducts()
      .then((r) => setProducts(r.data))
      .catch(() => notify("Failed to load products", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((r) => { if (!cancelled) setProducts(r.data); })
      .catch(() => { if (!cancelled) notify("Failed to load products", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [notify]);

  const handleSave = () => {
    const wasAdding = modal === "add";
    setModal(null);
    notify(wasAdding ? "Product created" : "Product updated");
    load();
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(toDelete.id);
      notify(`"${toDelete.name}" deleted`);
      load();
    } catch (e) {
      notify(e?.response?.data?.detail || "Failed to delete", "error");
    } finally {
      setToDelete(null);
    }
  };

  const term = search.trim().toLowerCase();
  const filtered = products.filter((p) =>
    [p.name, p.sku].some((f) => f?.toLowerCase().includes(term))
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div className="page-container page-enter">
      <PageHeader
        title="Products"
        subtitle={`${products.length} items in your catalog`}
        actions={
          <button id="add-product-btn" className="btn btn-primary" onClick={() => setModal("add")}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        }
      />

      <div className="surface">
        <div className="surface-header">
          <div>
            <div className="surface-title">Product Catalog</div>
            <div className="surface-subtitle">{filtered.length} of {products.length} shown</div>
          </div>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input
              id="product-search"
              className="form-input"
              style={{ paddingLeft: 32, width: 200, height: 34 }}
              placeholder="Search products"
              value={search}
              onChange={onSearch}
            />
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-wrapper">
              <div className="spinner" />
              <span>Loading products</span>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="table-empty">
                        <svg className="table-empty-icon" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />
                        </svg>
                        <h3>{search ? "No matching products" : "No products yet"}</h3>
                        <p>{search ? "Try a different search term" : "Click 'Add Product' to get started"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((p) => (
                    <tr key={p.id}>
                      <td><span className="cell-id">{fmtId(p.id)}</span></td>
                      <td className="cell-primary">{p.name}</td>
                      <td><span className="badge badge-gray">{p.sku}</span></td>
                      <td><strong>${p.price?.toFixed(2)}</strong></td>
                      <td><StockBadge qty={p.quantity} /></td>
                      <td>
                        <div className="cell-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)} id={`edit-product-${p.id}`}>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 13, height: 13 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setToDelete(p)} id={`delete-product-${p.id}`}>
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

      {modal && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          message={`This will permanently delete "${toDelete.name}" (SKU: ${toDelete.sku}). This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}

function Products() {
  const { preview } = usePreview();
  return preview ? <ProductsPreview /> : <ProductsLive />;
}

export default Products;
