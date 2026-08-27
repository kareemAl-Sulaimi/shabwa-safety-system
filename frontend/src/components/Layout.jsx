import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ThemeProvider } from '../context/ThemeContext'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <button className="menu-fab" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة">
            ☰
          </button>
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
