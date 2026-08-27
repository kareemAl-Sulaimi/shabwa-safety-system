import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LostReportPage from './pages/LostReportPage'
import FoundAnnouncementPage from './pages/FoundAnnouncementPage'
import RecordsPage from './pages/RecordsPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import RemindersPage from './pages/RemindersPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLostPage from './pages/AdminLostPage'
import AdminFoundPage from './pages/AdminFoundPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="lost-report" element={
          <ProtectedRoute><LostReportPage /></ProtectedRoute>
        } />
        <Route path="found-announcement" element={
          <ProtectedRoute><FoundAnnouncementPage /></ProtectedRoute>
        } />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="admin" element={
          <AdminRoute><AdminDashboardPage /></AdminRoute>
        } />
        <Route path="admin/lost" element={
          <AdminRoute><AdminLostPage /></AdminRoute>
        } />
        <Route path="admin/found" element={
          <AdminRoute><AdminFoundPage /></AdminRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
