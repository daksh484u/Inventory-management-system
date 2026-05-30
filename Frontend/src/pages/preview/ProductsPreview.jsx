import { useState } from "react";
import PageHeader from "../../components/PageHeader";

const SAMPLE = [
  { id: "PRD0001", name: "Wireless Keyboard Pro",      sku: "KB-001",    cat: "Electronics",  price: 49.99,  qty: 142, status: "Active" },
  { id: "PRD0002", name: "USB-C Hub 7-in-1",           sku: "HUB-220",   cat: "Peripherals",  price: 34.99,  qty: 87,  status: "Active" },
  { id: "PRD0003", name: "Noise-Cancel Headset",        sku: "AUD-905",   cat: "Audio",        price: 129.00, qty: 23,  status: "Active" },
  { id: "PRD0004", name: "27\" 4K Monitor",             sku: "MON-274",   cat: "Displays",     price: 449.00, qty: 15,  status: "Active" },
  { id: "PRD0005", name: "Ergonomic Mouse",             sku: "MS-118",    cat: "Peripherals",  price: 59.99,  qty: 210, status: "Active" },
  { id: "PRD0006", name: "Aluminium Laptop Stand",      sku: "STD-306",   cat: "Accessories",  price: 39.99,  qty: 54,  status: "Active" },
  { id: "PRD0007", name: "Mechanical Keyboard TKL",    sku: "KB-MEC-77", cat: "Electronics",  price: 89.99,  qty: 0,   status: "Inactive" },
  { id: "PRD0008", name: "Webcam 1080p Full HD",        sku: "CAM-108",   cat: "Peripherals",  price: 69.99,  qty: 38,  status: "Active" },
  { id: "PRD0009", name: "USB-C Cable 2m (3-pack)",     sku: "CBL-C2M",   cat: "Cables",       price: 12.99,  qty: 400, status: "Active" },
  { id: "PRD0010", name: "Portable SSD 1TB",            sku: "SSD-P1T",   cat: "Storage",      price: 119.00, qty: 6,   status: "Active" },
];

function StockBadge({ qty }) {
  if (qty === 0)  return <span className="badge badge-danger"><span className="badge-dot" />Out of stock</span>;
  if (qty <= 20)  return <span className="badge badge-warning"><span className="badge-dot" />{qty} low</span>;
  return             <span className="badge badge-success"><span className="badge-dot" />{qty} in stock</span>;
}

function SortIcon() {
  return (
    <span className="th-sort-icon">
      <svg viewBox="0 0 7 4" fill="currentColor"><path d="M3.5 0L7 4H0z"/></svg>
      <svg viewBox="0 0 7 4" fill="currentColor"><path d="M3.5 4L0 0h7z"/></svg>
    </span>
  );
}

export default function ProductsPreview() {
  const [search, setSearch] = useState("");
  const filtered = SAMPLE.filter((p) =>
    [p.name, p.sku, p.cat].some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container page-enter">
      <PageHeader title="Products" subtitle="10 items shown — sample data" actions={
        <button className="btn btn-primary">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      } />

      <div className="surface">
        <div className="table-toolbar">
          <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input className="form-input" style={{ paddingLeft: 32, height: 34 }} placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span className="toolbar-chip">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              All Categories
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 11, height: 11 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </span>
            <span className="toolbar-chip">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" /></svg>
              Sort by
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 11, height: 11 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </span>
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
                <th><span className="th-sort">Product ID <SortIcon /></span></th>
                <th><span className="th-sort">Name <SortIcon /></span></th>
                <th><span className="th-sort">Category <SortIcon /></span></th>
                <th><span className="th-sort">Price <SortIcon /></span></th>
                <th><span className="th-sort">Stock <SortIcon /></span></th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><span className="cell-id">{p.id}</span></td>
                  <td>
                    <div className="cell-primary">{p.name}</div>
                    <div className="cell-mono" style={{ marginTop: 2 }}>{p.sku}</div>
                  </td>
                  <td><span className="badge badge-gray">{p.cat}</span></td>
                  <td><strong>${p.price.toFixed(2)}</strong></td>
                  <td><StockBadge qty={p.qty} /></td>
                  <td>
                    {p.status === "Active"
                      ? <span className="badge badge-success"><span className="badge-dot" />Active</span>
                      : <span className="badge badge-danger"><span className="badge-dot" />Inactive</span>}
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn btn-secondary btn-sm">Edit</button>
                      <button className="icon-btn" style={{ width: 28, height: 28 }}>
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">Showing 1-{filtered.length} of {SAMPLE.length} products</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled>&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">&rsaquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
