export default function FilterBar({ active, onChange, statusFilters, activeStatus, onStatusChange }) {
  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'lost', label: 'المفقودات' },
    { key: 'found', label: 'الموجودات' },
  ]

  return (
    <div className="filter-bar">
      <div className="filter-bar__main">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`chip ${active === f.key ? 'chip--active' : ''}`}
            onClick={() => onChange(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {statusFilters && (
        <div className="filter-bar__status">
          {statusFilters.map((s) => (
            <button
              key={s.key}
              className={`chip chip--status ${activeStatus === s.key ? 'chip--active' : ''}`}
              onClick={() => onStatusChange(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
