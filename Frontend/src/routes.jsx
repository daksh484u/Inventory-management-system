import { Routes, Route, useLocation } from "react-router-dom";
import { usePreview } from "./hooks/usePreview";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import Sidebar from "./components/Navbar";

const PAGE_TITLES = {
  "/": { title: "Dashboard", subtitle: "Overview of your inventory" },
  "/products": { title: "Products", subtitle: "Manage your product catalog" },
  "/customers": { title: "Customers", subtitle: "View and manage customers" },
  "/orders": { title: "Orders", subtitle: "Track all orders" },
};

function RoutesConfig() {
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/orders/")
      ? { title: "Order Details", subtitle: "View order information" }
      : { title: "Daksh", subtitle: "" });

  const { preview, toggle } = usePreview();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div style={{ flex: 1 }}>
            <span className="topbar-title">{pageInfo.title}</span>
            {pageInfo.subtitle && (
              <span className="topbar-subtitle">{pageInfo.subtitle}</span>
            )}
          </div>

          <div className="topbar-actions">
            <span className="topbar-date">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {today}
            </span>

            <button
              className={`preview-toggle-btn${preview ? " active" : ""}`}
              onClick={toggle}
              title={preview ? "Switch to live data" : "Preview with sample data"}
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                {preview ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                )}
                {!preview && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
              </svg>
              {preview ? "Live" : "Preview"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default RoutesConfig;