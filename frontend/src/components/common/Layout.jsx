import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const { isAuthenticated, role } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Only show sidebar and navbar for authenticated users with a role
  if (!isAuthenticated || !role) {
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
