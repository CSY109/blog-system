interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

const Pagination = ({ current, total, pageSize, onChange }: PaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        &laquo; Prev
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`dots-${i}`} className="pagination-dots">
            ...
          </span>
        ) : (
          <button
            key={p}
            className={`pagination-btn${p === current ? ' active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="pagination-btn"
        disabled={current >= totalPages}
        onClick={() => onChange(current + 1)}
      >
        Next &raquo;
      </button>
    </div>
  );
};

export default Pagination;
