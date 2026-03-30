import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { motion } from 'framer-motion'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { 
  Users, Award, TrendingUp, AlertTriangle, CheckCircle, 
  Plus, FileText, Users2, ArrowUpRight, ArrowDownRight,
  Target, Zap, Search, Bell
} from 'lucide-react'
import StatsCard from '../../components/common/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const NGODashboard = () => {
  const { profile } = useAuth()
  const ngoId = profile?.ngoId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

  useEffect(() => {
    if (!ngoId) return

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [overview, trends, subjects, atRisk] = await Promise.all([
          api.dashboard.overview(ngoId),
          api.dashboard.trends(ngoId, { days: 30 }),
          api.dashboard.subjects(ngoId),
          api.dashboard.atRisk(ngoId)
        ])

        setDashboardData({
          overview: overview.data,
          trends: trends.data,
          subjects: subjects.data,
          atRisk: atRisk.data,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data.')
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [ngoId])

  if (loading) return <LoadingSpinner message="Analyzing mission metrics..." />

  const { overview = {}, trends = [], subjects = [], atRisk = [] } = dashboardData || {}

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
              Mission Control
            </span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-black text-slate-900 tracking-tight">
            Greetings, <span className="text-indigo-600">Admin</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 font-medium mt-1">
            Monitoring <span className="text-slate-900 font-bold">{profile?.ngoName || 'Codenyx Network'}</span> operations in real-time.
          </motion.p>
        </div>
        
        <motion.div variants={itemVariants} className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none w-64 shadow-sm"
              />
           </div>
           <button className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
           </button>
        </motion.div>
      </div>

      {/* Hero Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Students', value: overview.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: 'Avg Mastery', value: `${(overview.avgMasteryScore || 0).toFixed(1)}%`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Volunteers', value: overview.activeVolunteers, icon: Users2, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'At-Risk', value: overview.atRiskStudents, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
         ].map((stat, i) => (
           <motion.div 
             key={i} 
             variants={itemVariants}
             whileHover={{ y: -5 }}
             className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
           >
             <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                   <ArrowUpRight className="w-3 h-3" /> 12%
                </div>
             </div>
             <p className="text-3xl font-black text-slate-800">{stat.value || 0}</p>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{stat.label}</p>
           </motion.div>
         ))}
      </section>

      {/* Analytics Powerhouse */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div variants={itemVariants} className="lg:col-span-2 card p-8 group">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-black text-slate-800">Growth Performance</h3>
                  <p className="text-sm text-slate-400 font-medium tracking-tight">Average mastery scores across the network.</p>
               </div>
               <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                  Export PDF
               </button>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="avgMastery" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMastery)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="card p-8 bg-slate-900 text-white overflow-hidden relative">
            <h3 className="text-xl font-black mb-1 relative z-10">Subject Coverage</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 relative z-10">Top performing knowledge areas.</p>
            
            <div className="space-y-6 relative z-10">
               {subjects.slice(0, 4).map((s, idx) => (
                 <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-bold text-slate-200">{s.subject}</span>
                       <span className="text-xs font-black text-indigo-400">{s.avgScore.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${s.avgScore}%` }}
                         className="h-full bg-indigo-500 rounded-full"
                       />
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 relative z-10">
               <Link to="/ngo_admin/reports" className="flex items-center justify-between text-xs font-black uppercase text-slate-400 hover:text-white transition-colors group">
                  Detailed Breakdown
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         </motion.div>
      </section>

      {/* Risk Grid & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <motion.div variants={itemVariants} className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-rose-500" />
                  Priority Interventions
               </h3>
               <Link to="/ngo_admin/at-risk" className="text-xs font-black uppercase text-indigo-600 hover:opacity-70 transition-opacity tracking-widest">
                  View Priority List
               </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {atRisk.length > 0 ? (
                 atRisk.slice(0, 4).map((student) => (
                   <motion.div 
                     whileHover={{ x: 5 }}
                     key={student.id} 
                     className="p-5 bg-rose-50 rounded-3xl border border-rose-100 flex items-center justify-between group cursor-pointer"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center font-black text-rose-600 shadow-sm">
                           {student.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-slate-900">{student.name}</p>
                           <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Grade {student.grade} • {student.masteryScore}% Proficiency</p>
                        </div>
                     </div>
                     <Link to={`/ngo_admin/students/${student.id}`} className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-rose-600 transition-colors shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                     </Link>
                   </motion.div>
                 ))
               ) : (
                 <div className="col-span-2 py-10 bg-emerald-50 rounded-[2rem] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-emerald-600">
                    <CheckCircle className="w-10 h-10 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">All targets safe for today</p>
                 </div>
               )}
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <h3 className="text-xl font-black text-slate-900 px-2 lg:mt-2">Mission Actions</h3>
            <div className="grid grid-cols-1 gap-4">
               <Link to="/ngo_admin/students" className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white flex flex-col gap-4 group hover:shadow-2xl transition-all">
                  <div className="p-3 bg-white/10 rounded-2xl w-fit group-hover:bg-indigo-500 transition-colors">
                     <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Onboard Student</h4>
                    <p className="text-xs text-slate-400 font-medium">Register a new child to the platform.</p>
                  </div>
               </Link>
               <Link to="/ngo_admin/reports" className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col gap-4 group hover:shadow-xl transition-all shadow-sm">
                  <div className="p-3 bg-indigo-50 rounded-2xl w-fit text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">Generate Audit</h4>
                    <p className="text-xs text-slate-400 font-medium">Download impact and performance data.</p>
                  </div>
               </Link>
            </div>
         </motion.div>
      </section>
    </motion.div>
  )
}

export default NGODashboard
