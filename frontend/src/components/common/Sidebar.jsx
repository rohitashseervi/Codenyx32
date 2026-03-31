import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Zap,
  AlertCircle,
  Calendar,
  FileText,
  Award,
  TrendingUp,
  Settings,
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth()
  const location = useLocation()

  // Map role to URL prefix (ngo_admin → ngo for routes)
  const rolePrefix = role === 'ngo_admin' ? 'ngo' : role
  const roleKey = role === 'ngo_admin' ? 'ngo' : role

  const getSidebarItems = () => {
    const baseItems = [
      {
        label: 'Dashboard',
        href: `/${rolePrefix}/dashboard`,
        icon: LayoutDashboard,
      },
    ]

    const roleItems = {
      ngo: [
        { label: 'Students', href: '/ngo/students', icon: Users },
        { label: 'Volunteers', href: '/ngo/volunteers', icon: Zap },
        { label: 'Mentors', href: '/ngo/mentors', icon: Users },
        { label: 'Reports', href: '/ngo/reports', icon: FileText },
      ],
      volunteer: [
        { label: 'My Sessions', href: '/volunteer/sessions', icon: BookOpen },
        { label: 'Learning Path', href: '/volunteer/learning-path', icon: TrendingUp },
        { label: 'My Students', href: '/volunteer/students', icon: Users },
        { label: 'Test Results', href: '/volunteer/test-results', icon: Award },
      ],
      mentor: [
        { label: 'My Students', href: '/mentor/students', icon: Users },
        { label: 'Alerts', href: '/mentor/alerts', icon: AlertCircle },
        { label: 'Schedule', href: '/mentor/schedule', icon: Calendar },
        { label: 'Notes', href: '/mentor/notes', icon: FileText },
      ],
      student: [
        { label: 'My Classes', href: '/student/classes', icon: BookOpen },
        { label: 'My Mentor', href: '/student/mentor', icon: Users },
        { label: 'Tests', href: '/student/tests', icon: Award },
        { label: 'Progress', href: '/student/progress', icon: TrendingUp },
        { label: 'Badges', href: '/student/badges', icon: Award },
      ],
    }

    return [...baseItems, ...(roleItems[roleKey] || [])]
  }

  const items = getSidebarItems()
  const isActive = (href) => location.pathname === href

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto
        transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:h-[calc(100vh-64px)] md:top-16
      `}
      >
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    active
                      ? 'bg-primary-50 text-primary-600 font-semibold border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* Settings at bottom */}
          <Link
            to={`/${rolePrefix}/settings`}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${location.pathname.endsWith('/settings')
                ? 'bg-primary-50 text-primary-600 font-semibold border-l-4 border-primary-600'
                : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">Settings</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
