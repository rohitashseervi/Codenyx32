import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronRight,
  ShieldCheck,
  Globe,
  Rocket
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { role, profile } = useAuth()
  const location = useLocation()

  const getSidebarItems = () => {
    const baseItems = [
      {
        label: 'Intelligence',
        href: `/${role}/dashboard`,
        icon: LayoutDashboard,
      },
    ]

    const roleItems = {
      ngo_admin: [
        { label: 'Network', href: '/ngo_admin/students', icon: Users },
        { label: 'Ambassadors', href: '/ngo_admin/volunteers', icon: Rocket },
        { label: 'Guides', href: '/ngo_admin/mentors', icon: Globe },
        { label: 'Audits', href: '/ngo_admin/reports', icon: FileText },
      ],
      volunteer: [
        { label: 'Academy', href: '/volunteer/learning-path', icon: TrendingUp },
        { label: 'Sessions', href: '/volunteer/sessions', icon: Calendar },
        { label: 'Community', href: '/volunteer/students', icon: Users },
        { label: 'Badges', href: '/volunteer/test-results', icon: Award },
      ],
      mentor: [
        { label: 'Mentees', href: '/mentor/students', icon: Users },
        { label: 'Alerts', href: '/mentor/alerts', icon: AlertCircle },
        { label: 'Master Schedule', href: '/mentor/schedule', icon: Calendar },
        { label: 'Protocols', href: '/mentor/notes', icon: FileText },
      ],
      student: [
        { label: 'Classes', href: '/student/classes', icon: BookOpen },
        { label: 'Guidance', href: '/student/mentor', icon: ShieldCheck },
        { label: 'Achievements', href: '/student/tests', icon: Award },
        { label: 'Performance', href: '/student/progress', icon: TrendingUp },
      ],
    }

    return [...baseItems, ...(roleItems[role] || [])]
  }

  const items = getSidebarItems()
  const isActive = (href) => location.pathname === href

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] md:hidden" 
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial="closed"
        animate="open"
        variants={sidebarVariants}
        className={`
          fixed md:sticky top-0 left-0 h-[100dvh] w-72 bg-white border-r border-slate-100 overflow-y-auto
          transition-all duration-500 ease-in-out z-[120]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:h-[calc(100vh-140px)] md:top-[120px] md:bg-transparent md:border-none
        `}
      >
        <div className="flex flex-col h-full md:px-4">
          <div className="flex-1 space-y-8">
            {/* Mission Badge (Mobile Mode) */}
            <div className="p-8 md:hidden">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400">
                     <Zap className="w-6 h-6 fill-indigo-400" />
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">CodeNyx</span>
               </div>
            </div>

            <nav className="px-6 md:px-0 space-y-1">
               {items.map((item, idx) => {
                 const Icon = item.icon
                 const active = isActive(item.href)

                 return (
                   <motion.div
                     key={item.href}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                   >
                     <Link
                       to={item.href}
                       onClick={onClose}
                       className={`
                         flex items-center justify-between px-5 py-4 rounded-3xl transition-all duration-500 group
                         ${
                           active
                             ? 'bg-slate-900 text-white shadow-2xl shadow-indigo-500/20'
                             : 'text-slate-500 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:text-slate-900 border border-transparent'
                         }
                       `}
                     >
                       <div className="flex items-center gap-4">
                          <div className={`
                             p-2 rounded-xl transition-colors duration-500
                             ${active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-50 group-hover:bg-slate-100 text-slate-400 group-hover:text-indigo-600'}
                          `}>
                             <Icon className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                       </div>
                       {active ? (
                         <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                       ) : (
                         <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-300" />
                       )}
                     </Link>
                   </motion.div>
                 )
               })}
            </nav>
          </div>

          {/* Footer Control */}
          <div className="p-8 md:p-0 md:mt-10">
             <Link
               to="/settings"
               onClick={onClose}
               className={`
                 flex items-center gap-4 px-6 py-5 rounded-3xl transition-all duration-500 group border
                 ${isActive('/settings')
                   ? 'bg-slate-100 border-slate-200 text-slate-900'
                   : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-900'
                 }
               `}
             >
                <Settings className={`w-5 h-5 transition-transform group-hover:rotate-90 duration-700 ${isActive('/settings') ? 'text-indigo-600' : ''}`} />
                <span className="text-xs font-black uppercase tracking-widest">Settings</span>
             </Link>

             <div className="mt-8 px-2 hidden md:block">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group/card shadow-2xl shadow-indigo-950/20">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Alpha Session</p>
                      <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-4">You are currently monitoring the CodeNyx Network.</p>
                      <button className="w-full py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-colors">
                         View Stats
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover/card:scale-150 transition-transform duration-700"></div>
                </div>
             </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
