import { useState } from "react";
import PageHeader from "../../components/PageHeader";

const SAMPLE = [
  { id: "CUS0001", name: "Rahul Sharma",    email: "rahul.s@techcorp.in",  phone: "+91 98765 43210", orders: 24, spent: "₹2,640", joined: "12 Jan 2024", status: "Active" },
  { id: "CUS0002", name: "Priya Mehta",     email: "priya.m@gmail.com",    phone: "+91 91234 56789", orders: 8,  spent: "₹892",   joined: "03 Mar 2024", status: "Active" },
  { id: "CUS0003", name: "Arjun Kapoor",    email: "arjun@startup.io",     phone: "+91 87654 32109", orders: 16, spent: "₹1,840", joined: "19 Nov 2023", status: "Active" },
  { id: "CUS0004", name: "Sneha Iyer",      email: "sneha.i@corp.com",     phone: "+91 99887 76655", orders: 31, spent: "₹4,120", joined: "07 Aug 2023", status: "Active" },
  { id: "CUS0005", name: "Vikram Singh",    email: "vikram.s@retail.co",   phone: "+91 70001 23456", orders: 3,  spent: "₹238",   joined: "15 Apr 2025", status: "Active" },
  { id: "CUS0006", name: "Anjali Desai",    email: "anjali.d@biz.in",      phone: "+91 63345 67890", orders: 12, spent: "₹1,120", joined: "22 Jun 2024", status: "Active" },
  { id: "CUS0007", name: "Rohan Gupta",     email: "rohan.g@agency.in",    phone: "+91 82234 56789", orders: 5,  spent: "₹485",   joined: "30 Sep 2024", status: "Inactive" },
  { id: "CUS0008", name: "Neha Joshi",      email: "neha.j@firm.in",       phone: "+91 94455 12345", orders: 19, spent: "₹2,100", joined: "11 Feb 2024", status: "Active" },
];

const AVATAR_COLORS = ["#14b8a6", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#0ea5e9", "#f97316"];

function Avatar({ name, idx }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function SortIcon() {
  return (
    <span className="th-sort-icon">
      <svg viewBox="0 0 7 4" fill="currentColor"><path d="M3.5 0L7 4H0z"/></svg>
      <svg viewBox="0 0 7 4" fill="currentColor"><path d="M3.5 4L0 0h7z"/></svg>
    </span>
  );
}

export default function CustomersPreview() {
  const [search, setSearch] = useState("");
  const filtered = SAMPLE.filter((c) =>
    [c.name, c.email, c.phone].some((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container page-enter">
      <PageHeader title="Customers" subtitle="8 customers shown — sample data" actions={
        <button className="btn btn-primary">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Customer
        </button>
      } />

      <div className="surface">
        <div className="table-toolbar">
          <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-tertiary)", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
            <input className="form-input" style={{ paddingLeft: 32, height: 34 }} placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span className="toolbar-chip">All Status <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 11, height: 11 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></span>
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
                <th><span className="th-sort">Customer ID <SortIcon /></span></th>
                <th><span className="th-sort">Customer <SortIcon /></span></th>
                <th><span className="th-sort">Email <SortIcon /></span></th>
                <th>Phone</th>
                <th><span className="th-sort">Orders <SortIcon /></span></th>
                <th><span className="th-sort">Total Spent <SortIcon /></span></th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td><span className="cell-id">{c.id}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={c.name} idx={i} />
                      <div>
                        <div className="cell-primary">{c.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>Joined {c.joined}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.email}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{c.phone}</td>
                  <td><strong>{c.orders}</strong></td>
                  <td><strong style={{ color: "var(--brand-600)" }}>{c.spent}</strong></td>
                  <td>
                    {c.status === "Active"
                      ? <span className="badge badge-success"><span className="badge-dot" />Active</span>
                      : <span className="badge badge-danger"><span className="badge-dot" />Inactive</span>}
                  </td>
                  <td>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}>
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">Showing 1-{filtered.length} of {SAMPLE.length} customers</span>
          <div className="pagination-controls">
            <button className="page-btn" disabled>&lsaquo;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">&rsaquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
