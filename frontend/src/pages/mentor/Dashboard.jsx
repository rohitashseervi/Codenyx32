import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { motion } from 'framer-motion'
import { 
  Users, AlertCircle, Clock, BookOpen, 
  ChevronRight, Calendar, MessageSquare, 
  TrendingUp, Star, Bell, Zap
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const MentorDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    studentsAssigned: 0,
    maxStudents: 5,
    upcomingSessions: 0,
    alerts: [],
    students: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [studentsRes, alertsRes] = await Promise.all([
          api.mentor.getStudents(),
          api.mentor.getAlerts()
        ])

        const students = studentsRes.data.students || []
        const alerts = alertsRes.data.alerts || []

        setDashboardData({
          studentsAssigned: students.length,
          maxStudents: 5,
          upcomingSessions: Math.floor(Math.random() * 3) + 1,
          alerts: alerts.slice(0, 5),
          students: students,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner message="Orchestrating mentorship metrics..." />

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const mentorFirstName = profile?.name?.split(' ')[0] || 'Mentor'

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Hero Welcome Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl"
        >
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-fit px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
            >
              Excellence in Mentorship 2024
            </motion.div>
            <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
              Welcome back, <br/>
              <span className="text-indigo-400">{mentorFirstName}!</span> ⚡
            </h1>
            <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
               Your students have shown a <span className="text-emerald-400 font-bold">14% growth</span> this month. Great leadership!
            </p>
            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => navigate('/mentor/students')}
                className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all flex items-center gap-2 group"
              >
                Track Progress <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mb-20"></div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-6">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Next 24h</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 leading-tight">Upcoming Sessions</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">3 guidance meetings scheduled.</p>
           </div>
           <div className="mt-8 space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-xs font-black text-slate-800">Rahul Sharma</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Career Guidance • 4PM</p>
                 </div>
                 <button className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4 fill-indigo-600" />
                 </button>
              </div>
           </div>
        </motion.div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Mentees', value: `${dashboardData.studentsAssigned}/${dashboardData.maxStudents}`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Engagement', value: '94%', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
           { label: 'Active Alerts', value: dashboardData.alerts.length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
           { label: 'Avg Mastery', value: '72%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
         ].map((stat, i) => (
           <motion.div 
             key={i} 
             variants={itemVariants}
             whileHover={{ y: -5 }}
             className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
           >
             <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                </div>
             </div>
           </motion.div>
         ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Left Column: Student Management */}
         <div className="lg:col-span-8 space-y-8">
            <motion.div variants={itemVariants} className="card p-10 bg-white border border-slate-100 shadow-xl shadow-slate-100/50">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <BookOpen className="w-7 h-7 text-indigo-600" />
                     Assigned Students
                  </h2>
                  <button onClick={() => navigate('/mentor/students')} className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:opacity-70 transition-opacity">
                     View All Directory
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.students.length > 0 ? (
                    dashboardData.students.map((student) => (
                      <div key={student.id} className="group p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:text-indigo-600 border border-slate-200 group-hover:border-indigo-200 transition-all font-outfit uppercase">
                               {student.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{student.name}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Grade {student.grade} • {student.latestScore || '0'}% Latest</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => navigate(`/mentor/students/${student.id}`)}
                           className="p-2.5 bg-white rounded-xl text-slate-400 group-hover:text-indigo-600 border border-slate-200 group-hover:border-indigo-200 transition-all shadow-sm"
                         >
                            <ArrowRight className="w-4 h-4" />
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                       <p className="font-bold text-sm">No students assigned yet.</p>
                       <p className="text-xs mt-1">Join an NGO to start mentoring.</p>
                    </div>
                  )}
               </div>
            </motion.div>
         </div>

         {/* Right Column: Alerts & Actions */}
         <div className="lg:col-span-4 space-y-8">
            <motion.div variants={itemVariants} className="bg-rose-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-rose-200/50">
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black">Urgent Attention</h3>
                     <AlertCircle className="w-8 h-8 text-rose-200" />
                  </div>
                  <div className="space-y-4">
                     {dashboardData.alerts.length > 0 ? (
                       dashboardData.alerts.map((alert, idx) => (
                         <div key={idx} className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all">
                            <p className="text-sm font-bold text-white mb-1">{alert.studentName}</p>
                            <p className="text-[10px] font-black text-rose-200 uppercase tracking-tighter mb-4">Scored {alert.score}% in {alert.topic}</p>
                            <button className="w-full py-2 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors">
                               Schedule Urgent Peer Call
                            </button>
                         </div>
                       ))
                     ) : (
                       <p className="text-center font-bold text-xs text-rose-100/60 py-6">All clear! No students need urgent intervention today.</p>
                     )}
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-8 bg-slate-900 border-none">
               <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  Quick Tools
               </h3>
               <div className="space-y-3">
                  <button className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-indigo-600 transition-all">
                     <span className="text-white text-xs font-bold">Write Mentor Note</span>
                     <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </button>
                  <button className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-indigo-600 transition-all">
                     <span className="text-white text-xs font-bold">Contact NGO Admin</span>
                     <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </button>
               </div>
            </motion.div>
         </div>
      </section>
    </motion.div>
  )
}

// Internal component for arrow icons used in buttons
const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

export default MentorDashboard
