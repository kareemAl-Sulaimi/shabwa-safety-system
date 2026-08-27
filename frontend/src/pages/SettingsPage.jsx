import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const data = {}
      if (form.name !== user.name) data.name = form.name
      if (form.email !== user.email) data.email = form.email || null
      if (form.phone !== user.phone) data.phone = form.phone || null
      const updated = await api.users.updateMe(data)
      updateUser(updated)
      setMessage('تم حفظ التغييرات بنجاح')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <header className="page-heading">
        <h1 className="page-heading__title">الإعدادات</h1>
      </header>

      <section className="settings-section">
        <h2>🌙 المظهر</h2>
        <div className="settings-row">
          <span>الوضع الليلي / النهاري</span>
          <button className="theme-switch" onClick={toggleTheme}>
            {dark ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>اللغة</h2>
        <div className="settings-row">
          <span>اللغة</span>
          <span className="settings-value">العربية فقط</span>
        </div>
      </section>

      {user ? (
        <section className="settings-section">
          <h2>الملف الشخصي</h2>
          <form onSubmit={handleSubmit} className="settings-form">
            {message && <div className="alert alert--success">{message}</div>}
            {error && <div className="alert alert--error">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">الاسم</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </section>
      ) : (
        <section className="settings-section">
          <h2>الحساب</h2>
          <p className="settings-note">
            سجّل الدخول لتفعيل خيارات الحساب وإدارة ملفك الشخصي.
          </p>
          <div className="settings-auth">
            <Link to="/login" className="btn btn--primary">تسجيل الدخول</Link>
            <Link to="/register" className="btn btn--ghost">حساب جديد</Link>
          </div>
        </section>
      )}

      {user?.role === 'ADMIN' && (
        <section className="settings-section">
          <h2>إدارة النظام</h2>
          <button className="btn btn--admin" onClick={() => navigate('/admin')}>
            لوحة تحكم الأدمن
          </button>
        </section>
      )}
    </div>
  )
}
