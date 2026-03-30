import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { motion, AnimatePresence } from 'framer-motion'

const Layout = ({ children }) => {
  const { isAuthenticated, role } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Only show sidebar and navbar for authenticated users with a role
  if (!isAuthenticated || !role) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="min-h-screen bg-white"
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] selection:bg-indigo-100 selection:text-indigo-700">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]" />
      </div>

      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-col md:flex-row max-w-[1600px] mx-auto relative z-10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 w-full min-h-screen pt-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 md:p-10"
            >
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Global Toast / Notification Area placeholder if needed */}
    </div>
  )
}

export default Layout
