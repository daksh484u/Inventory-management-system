import { Routes, Route, useLocation } from "react-router-dom";

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

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div style={{ flex: 1 }}>
            <span className="topbar-title">{pageInfo.title}</span>
            {pageInfo.subtitle && (
              <span className="topbar-subtitle">— {pageInfo.subtitle}</span>
            )}
          </div>

          <div className="topbar-actions">
            <div className="topbar-search">
              <svg className="topbar-search-icon" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
              </svg>
              <input type="search" placeholder="Search…" id="global-search" />
            </div>

            <button className="icon-btn" title="Notifications" id="notif-btn">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
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