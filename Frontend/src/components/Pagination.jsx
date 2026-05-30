export default function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}-{end} of {total}
      </span>
      {pages > 1 && (
        <div className="pagination-controls">
          <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
            &lsaquo;
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`page-btn${n === page ? " active" : ""}`}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          ))}
          <button className="page-btn" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}
