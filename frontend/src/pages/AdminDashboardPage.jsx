import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.admin.dashboard()
      .then(setStats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="alert alert--error">{error}</div>

  return (
    <div className="admin-page">
      <header className="page-heading">
        <h1 className="page-heading__title">لوحة تحكم الأدمن</h1>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-card__number">{stats?.total_users || 0}</span>
          <span className="stat-card__label">المستخدمين</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__number">{stats?.total_lost_reports || 0}</span>
          <span className="stat-card__label">بلاغات المفقودات</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__number">{stats?.total_found_announcements || 0}</span>
          <span className="stat-card__label">إعلانات الموجودات</span>
        </div>
      </div>

      <div className="admin-links">
        <Link to="/admin/lost" className="admin-link-card">
          <span className="admin-link-card__icon">🔍</span>
          <span className="admin-link-card__label">إدارة بلاغات المفقودات</span>
        </Link>
        <Link to="/admin/found" className="admin-link-card">
          <span className="admin-link-card__icon">✨</span>
          <span className="admin-link-card__label">إدارة إعلانات الموجودات</span>
        </Link>
      </div>
    </div>
  )
}
