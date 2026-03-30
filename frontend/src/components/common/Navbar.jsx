import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, LogOut, User, Settings, Bell, ChevronDown, Zap } from 'lucide-react'
import { Menu as HeadlessMenu, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const { user, role, logout, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getRoleLabel = (r) => {
    const labels = {
      ngo_admin: 'Mission Control',
      volunteer: 'Ambassador',
      mentor: 'Guide',
      student: 'Scholar',
    }
    return labels[r] || r
  }

  const getRoleDashboardPath = () => {
    const paths = {
      ngo_admin: '/ngo_admin/dashboard',
      volunteer: '/volunteer/dashboard',
      mentor: '/mentor/dashboard',
      student: '/student/dashboard',
    }
    return paths[role] || '/'
  }

  const getNavLinks = () => {
    if (!role) return []
    const links = {
      ngo_admin: [
        { label: 'Intelligence', href: '/ngo_admin/dashboard' },
        { label: 'Network', href: '/ngo_admin/students' },
        { label: 'Coalition', href: '/ngo_admin/volunteers' },
        { label: 'Audits', href: '/ngo_admin/reports' },
      ],
      volunteer: [
        { label: 'Focus', href: '/volunteer/dashboard' },
        { label: 'Sessions', href: '/volunteer/sessions' },
        { label: 'Academy', href: '/volunteer/learning-path' },
      ],
      mentor: [
        { label: 'Pulse', href: '/mentor/dashboard' },
        { label: 'Mentees', href: '/mentor/students' },
        { label: 'Alerts', href: '/mentor/alerts' },
      ],
      student: [
        { label: 'Explorer', href: '/student/dashboard' },
        { label: 'Classes', href: '/student/classes' },
        { label: 'Progress', href: '/student/progress' },
      ],
    }
    return links[role] || []
  }

  const navLinks = getNavLinks()
  const isActive = (href) => location.pathname.startsWith(href)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled 
        ? 'py-3 px-4' 
        : 'py-5 px-6'
    }`}>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`max-w-7xl mx-auto rounded-[2rem] border transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-2xl border-slate-200/50 shadow-2xl shadow-indigo-500/10' 
            : 'bg-white border-transparent shadow-sm'
        }`}
      >
        <div className="px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* High-End Logo */}
            <Link to={role ? getRoleDashboardPath() : '/'} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                  <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">CodeNyx</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-none mt-1">Education</span>
              </div>
            </Link>

            {/* Futuristic Desktop Linkage */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${
                    isActive(link.href)
                      ? 'text-indigo-600'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Utility & Profile Cluster */}
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
              </button>

              {user ? (
                <HeadlessMenu as="div" className="relative">
                  <HeadlessMenu.Button className="flex items-center gap-3 pl-2 pr-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-2xl transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 text-xs font-black ring-4 ring-indigo-500/10">
                      {profile?.name?.[0] || 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left mr-2">
                       <span className="text-xs font-black text-slate-900 leading-none">
                         {profile?.name?.split(' ')[0] || 'User'}
                       </span>
                       <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter mt-1">
                         {getRoleLabel(role)}
                       </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </HeadlessMenu.Button>

                  <Transition
                    enter="transition duration-200 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-100 ease-in"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <HeadlessMenu.Items className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-[110] focus:outline-none overflow-hidden">
                       <div className="px-5 py-3 mb-2 border-b border-slate-50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</p>
                          <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                       </div>
                       
                       <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link to="/profile" className={`flex items-center gap-3 px-5 py-3 text-xs font-bold ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                            <div className={`p-2 rounded-lg ${active ? 'bg-white' : 'bg-slate-50'}`}><User className="w-3.5 h-3.5" /></div>
                            Operational Profile
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link to="/settings" className={`flex items-center gap-3 px-5 py-3 text-xs font-bold ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}>
                            <div className={`p-2 rounded-lg ${active ? 'bg-white' : 'bg-slate-50'}`}><Settings className="w-3.5 h-3.5" /></div>
                            System Settings
                          </Link>
                        )}
                      </HeadlessMenu.Item>

                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button onClick={handleLogout} className={`flex items-center gap-3 px-5 py-4 mt-2 text-xs font-black w-full text-left border-t border-slate-50 ${active ? 'bg-rose-50 text-rose-600' : 'text-slate-800'}`}>
                            <div className={`p-2 rounded-lg ${active ? 'bg-white text-rose-600' : 'bg-rose-50 text-rose-600'}`}><LogOut className="w-3.5 h-3.5" /></div>
                            Terminate Session
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    </HeadlessMenu.Items>
                  </Transition>
                </HeadlessMenu>
              ) : (
                <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all">
                   Sign In
                </Link>
              )}

              {/* Advanced Mobile Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Liquid Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-slate-50 bg-white rounded-b-[2rem]"
            >
              <div className="p-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      isActive(link.href) 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  )
}

export default Navbar
