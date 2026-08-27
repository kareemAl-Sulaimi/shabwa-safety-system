import { useState, useEffect, useMemo } from 'react'
import { api } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import DateField from '../components/DateField'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function RecordsPage() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.history.list(0, 100)
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusFilters = () => {
    if (filter === 'lost') {
      return [
        { key: 'all', label: 'الكل' },
        { key: 'FOUND', label: 'تم العثور عليه' },
        { key: 'CLOSED', label: 'مغلق' },
      ]
    }
    if (filter === 'found') {
      return [
        { key: 'all', label: 'الكل' },
        { key: 'DELIVERED', label: 'تم التسليم' },
        { key: 'CLOSED', label: 'مغلق' },
      ]
    }
    return [
      { key: 'all', label: 'الكل' },
      { key: 'FOUND', label: 'تم العثور عليه' },
      { key: 'DELIVERED', label: 'تم التسليم' },
      { key: 'CLOSED', label: 'مغلق' },
    ]
  }

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filter === 'lost' && item.content_type !== 'lost_report') return false
      if (filter === 'found' && item.content_type !== 'found_announcement') return false
      if (statusFilter !== 'all' && item.state !== statusFilter) return false
      const d = new Date(item.updated_at)
      if (startDate && d < new Date(startDate + 'T00:00:00')) return false
      if (endDate && d > new Date(endDate + 'T23:59:59')) return false
      return true
    })
  }, [items, filter, statusFilter, startDate, endDate])

  if (loading) return <LoadingSpinner />

  return (
    <div className="records-page">
      <header className="page-heading">
        <h1 className="page-heading__title">السجلات</h1>
        <p className="page-heading__subtitle">سجل التغييرات والنتائج السابقة</p>
      </header>

      <div className="filter-bar">
        <div className="filter-bar__main">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'lost', label: 'المفقودات' },
            { key: 'found', label: 'الموجودات' },
          ].map((f) => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? 'chip--active' : ''}`}
              onClick={() => { setFilter(f.key); setStatusFilter('all') }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="filter-bar__status">
          {getStatusFilters().map((s) => (
            <button
              key={s.key}
              className={`chip chip--status ${statusFilter === s.key ? 'chip--active' : ''}`}
              onClick={() => setStatusFilter(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="date-filter">
        <div className="date-filter__field">
          <DateField
            label="من تاريخ"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-filter__field">
          <DateField
            label="إلى تاريخ"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        {(startDate || endDate) && (
          <button className="btn btn--ghost btn--sm" onClick={() => { setStartDate(''); setEndDate('') }}>
            مسح الفلترة
          </button>
        )}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📁</span>
          <p>لا توجد سجلات</p>
        </div>
      ) : (
        <div className="records-list">
          {filtered.map((item) => (
            <article key={`${item.content_type}-${item.id}`} className="record-card">
              <div className="record-card__head">
                <span className={`record-card__type record-card__type--${item.content_type}`}>
                  {item.content_type === 'lost_report' ? '🔍 مفقود' : '✨ موجود'}
                </span>
                <StatusBadge state={item.state} />
              </div>
              <div className="record-card__body">
                <div className="record-card__row">
                  <span className="record-card__label">النوع</span>
                  <span className="record-card__value">{item.item_type}</span>
                </div>
                <div className="record-card__row">
                  <span className="record-card__label">الوصف</span>
                  <span className="record-card__value">{item.description}</span>
                </div>
                <div className="record-card__row">
                  <span className="record-card__label">الموقع</span>
                  <span className="record-card__value">{item.location}</span>
                </div>
                <div className="record-card__row">
                  <span className="record-card__label">التاريخ</span>
                  <span className="record-card__value">{formatDate(item.date)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
