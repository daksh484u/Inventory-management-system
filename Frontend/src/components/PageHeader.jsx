import { Link } from "react-router-dom";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <div className="breadcrumb">
          <Link to="/">Dashboard</Link>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="current">{title}</span>
        </div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}
