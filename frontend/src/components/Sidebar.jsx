import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    onClose()
  }

  const navItems = [
    { to: '/', label: 'التحديثات', icon: '📋' },
    { to: '/records', label: 'السجلات', icon: '📁' },
    { to: '/lost-report', label: 'إبلاغ فقدان', icon: '🔍', auth: true },
    { to: '/found-announcement', label: 'إعلان إيجاد', icon: '✨', auth: true },
    { to: '/reminders', label: 'تذكير', icon: '📖' },
    { to: '/settings', label: 'الإعدادات', icon: '⚙️' },
    { to: '/about', label: 'حول مطور النظام', icon: '👨‍💻' },
  ]

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <img src="/icon.png" alt="أمان شبوة" className="sidebar__brand-icon" />
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">أمان شبوة</span>
              <span className="sidebar__brand-en">Shabwa Safety System</span>
              <span className="sidebar__brand-abbr">SSS</span>
            </div>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="إغلاق القائمة">✕</button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => {
            if (item.auth && !user) return null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                onClick={onClose}
              >
                <span className="sidebar__icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar__link sidebar__link--admin ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar__icon">🛡️</span>
              إدارة النظام
            </NavLink>
          )}
        </nav>

        <div className="sidebar__footer">
          {user ? (
            <div className="sidebar__user">
              <span className="sidebar__user-name">{user.name}</span>
              <button className="sidebar__logout" onClick={handleLogout}>تسجيل الخروج</button>
            </div>
          ) : (
            <div className="sidebar__auth-buttons">
              <NavLink to="/login" className="sidebar__login-btn" onClick={onClose}>تسجيل الدخول</NavLink>
              <NavLink to="/register" className="sidebar__register-btn" onClick={onClose}>حساب جديد</NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
