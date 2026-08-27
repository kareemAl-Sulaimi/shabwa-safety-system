const STATUS_MAP = {
  ACTIVE: { label: 'جاري', className: 'status--active' },
  FOUND: { label: 'تم العثور عليه', className: 'status--found' },
  CLOSED: { label: 'مغلق', className: 'status--closed' },
  DELIVERED: { label: 'تم التسليم', className: 'status--delivered' },
}

export default function StatusBadge({ state }) {
  const info = STATUS_MAP[state] || { label: state, className: '' }
  return <span className={`status-badge ${info.className}`}>{info.label}</span>
}
