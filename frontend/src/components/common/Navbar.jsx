import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, LogOut, User, Settings } from 'lucide-react'
import { Menu as HeadlessMenu } from '@headlessui/react'

const Navbar = ({ onMenuToggle }) => {
  const { user, role, logout, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getRoleLabel = (r) => {
    const labels = {
      ngo_admin: 'NGO Admin',
      volunteer: 'Volunteer',
      mentor: 'Mentor',
      student: 'Student',
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
        { label: 'Dashboard', href: '/ngo_admin/dashboard' },
        { label: 'Students', href: '/ngo_admin/students' },
        { label: 'Volunteers', href: '/ngo_admin/volunteers' },
        { label: 'Mentors', href: '/ngo_admin/mentors' },
        { label: 'Reports', href: '/ngo_admin/reports' },
      ],
      volunteer: [
        { label: 'Dashboard', href: '/volunteer/dashboard' },
        { label: 'Sessions', href: '/volunteer/sessions' },
        { label: 'Learning Path', href: '/volunteer/learning-path' },
        { label: 'Students', href: '/volunteer/students' },
      ],
      mentor: [
        { label: 'Dashboard', href: '/mentor/dashboard' },
        { label: 'Students', href: '/mentor/students' },
        { label: 'Schedule', href: '/mentor/schedule' },
        { label: 'Alerts', href: '/mentor/alerts' },
      ],
      student: [
        { label: 'Dashboard', href: '/student/dashboard' },
        { label: 'Classes', href: '/student/classes' },
        { label: 'Tests', href: '/student/tests' },
        { label: 'Progress', href: '/student/progress' },
      ],
    }

    return links[role] || []
  }

  const navLinks = getNavLinks()
  const isActive = (href) => location.pathname.startsWith(href.split('/').slice(0, 3).join('/'))

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={role ? getRoleDashboardPath() : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GZ</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">GapZero</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - User menu & Mobile toggle */}
          <div className="flex items-center gap-4">
            {user && (
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {profile?.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {profile?.name || user.email}
                  </span>
                </HeadlessMenu.Button>

                <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {role && (
                    <HeadlessMenu.Item>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-sm font-semibold text-gray-900">{getRoleLabel(role)}</p>
                      </div>
                    </HeadlessMenu.Item>
                  )}

                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${
                          active ? 'bg-gray-100' : ''
                        }`}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    )}
                  </HeadlessMenu.Item>

                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`flex items-center gap-2 px-4 py-2 text-sm ${
                          active ? 'bg-gray-100' : ''
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    )}
                  </HeadlessMenu.Item>

                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left border-t border-gray-200 ${
                          active ? 'bg-danger-50' : ''
                        } text-danger-600`}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </HeadlessMenu.Items>
              </HeadlessMenu>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'text-primary-600 bg-primary-50' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
