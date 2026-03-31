import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Pages that should never show the dashboard layout
  const publicPaths = ['/', '/login', '/signup', '/test']
  const isPublicPage = publicPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith('/test/')
  )

  // Only show sidebar and navbar for authenticated users on dashboard pages
  if (!isAuthenticated || !role || isPublicPage) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
