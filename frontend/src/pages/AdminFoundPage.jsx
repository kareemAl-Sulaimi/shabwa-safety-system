import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-EG')
}

export default function AdminFoundPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await api.admin.foundAnnouncements()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    try {
      await api.admin.deleteFound(id)
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleStateChange = async (id, action) => {
    try {
      if (action === 'deliver') await api.foundAnnouncements.deliver(id)
      else if (action === 'close') await api.foundAnnouncements.close(id)
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <button className="btn btn--secondary" onClick={() => navigate('/admin')}>← العودة</button>
        <h1 className="page-heading__title">إدارة إعلانات الموجودات</h1>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المعرف</th>
              <th>النوع</th>
              <th>الوصف</th>
              <th>الموقع</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className={item.deleted_at ? 'row--deleted' : ''}>
                <td>{item.id}</td>
                <td>{item.item_type}</td>
                <td className="td-description">{item.description}</td>
                <td>{item.location}</td>
                <td>{formatDate(item.found_date)}</td>
                <td><StatusBadge state={item.state} /></td>
                <td className="td-actions">
                  {item.state === 'ACTIVE' && (
                    <>
                      <button className="btn btn--success btn--xs" onClick={() => handleStateChange(item.id, 'deliver')}>سلم</button>
                      <button className="btn btn--secondary btn--xs" onClick={() => handleStateChange(item.id, 'close')}>أغلق</button>
                    </>
                  )}
                  {!item.deleted_at && (
                    <button className="btn btn--danger btn--xs" onClick={() => handleDelete(item.id)}>حذف</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
