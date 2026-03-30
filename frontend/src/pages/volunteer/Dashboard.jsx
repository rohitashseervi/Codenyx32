import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { motion } from 'framer-motion'
import { 
  Clock, Users, TrendingUp, FileText, 
  ChevronRight, Calendar, Zap, Play, 
  CheckCircle2, Star, Target, ArrowRight
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const VolunteerDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upcomingSessions, setUpcomingSessions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sessionsRes] = await Promise.all([
        api.volunteer.getSessions({ status: 'all', limit: 10 }),
      ])

      const allSessions = sessionsRes.data.data || sessionsRes.data.sessions || sessionsRes.data || []
      setSessions(allSessions)

      const upcoming = allSessions
        .filter((s) => {
          const sessionDate = new Date(s.scheduledDate || s.date)
          const today = new Date()
          return sessionDate >= today && s.status !== 'completed'
        })
        .sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date))
        .slice(0, 3)

      setUpcomingSessions(upcoming)

      setStats({
        totalSessions: allSessions.filter((s) => s.status === 'completed').length,
        studentsTeaching: 24,
        avgStudentScore: 78.5,
        testsCreated: 8,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async (sessionId, meetLink) => {
    try {
      await api.volunteer.startSession(sessionId)
      toast.success('Session started! Opening Google Meet...')
      if (meetLink) {
        window.open(meetLink, '_blank')
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      toast.error('Failed to start session')
    }
  }

  if (loading) return <LoadingSpinner message="Igniting your volunteer dashboard..." />

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  const volunteerFirstName = profile?.name?.split(' ')[0] || 'Volunteer'

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Dynamic Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200/50"
        >
          <div className="relative z-10">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
            >
              Certified Volunteer
            </motion.span>
            <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
               You're changing <br/>
               <span className="text-blue-200">lives, {volunteerFirstName}!</span> 🌍
            </h1>
            <p className="text-blue-100 text-lg max-w-sm font-medium leading-relaxed">
               Your sessions have impacted 24 students this week. Keep up the humanitarian spirit!
            </p>
            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => navigate('/volunteer/sessions')}
                className="px-8 py-3.5 bg-white text-blue-700 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center gap-2 group"
              >
                Go to Sessions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          {/* Decorative Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>
        </motion.div>

        {/* Featured session */}
        <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col justify-between relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Zap className="w-6 h-6 fill-blue-600" />
                 </div>
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Live Now</span>
              </div>
              {upcomingSessions[0] ? (
                <>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">{upcomingSessions[0].topic}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{new Date(upcomingSessions[0].scheduledDate || upcomingSessions[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today</p>
                  <button 
                    onClick={() => handleStartSession(upcomingSessions[0]._id || upcomingSessions[0].id, upcomingSessions[0].meetLink)}
                    className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Teaching
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                   <p className="text-sm font-bold text-slate-400">No session scheduled right now.</p>
                   <button onClick={() => navigate('/volunteer/learning-path')} className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest">Prepare Modules</button>
                </div>
              )}
           </div>
           {/* bg grain */}
           <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
        </motion.div>
      </section>

      {/* Stats KPI Block */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: 'Classes Taught', value: stats?.totalSessions || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Students Impacted', value: stats?.studentsTeaching || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Avg Mastery Rate', value: `${stats?.avgStudentScore || 0}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Test Modules', value: stats?.testsCreated || 0, icon: Target, color: 'text-rose-600', bg: 'bg-rose-50' },
         ].map((stat, i) => (
           <motion.div 
             key={i} 
             variants={itemVariants}
             whileHover={{ y: -5 }}
             className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
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

      {/* Schedule & Calendar Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <motion.div variants={itemVariants} className="card p-10 bg-white border border-slate-100 shadow-xl shadow-slate-100/50">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <Calendar className="w-7 h-7 text-blue-600" />
                     Weekly Planner
                  </h2>
                  <button onClick={() => navigate('/volunteer/sessions')} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:opacity-70 transition-opacity">
                     Full Schedule
                  </button>
               </div>

               {/* Calendar Strip */}
               <div className="grid grid-cols-7 gap-3 mb-10">
                 {weekDays.map(date => {
                   const isToday = date.toDateString() === today.toDateString()
                   return (
                     <div key={date.toISOString()} className={`flex flex-col items-center p-4 rounded-3xl border transition-all ${isToday ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 cursor-pointer'}`}>
                        <span className="text-[10px] font-black uppercase mb-1 tracking-tighter">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-black">{date.getDate()}</span>
                     </div>
                   )
                 })}
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Confirmed Classes</h4>
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session, idx) => (
                      <div key={idx} className="group p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-lg transition-all flex items-center justify-between">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                               {new Date(session.scheduledDate || session.date).getDate()}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800 text-lg">{session.topic}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-md">Science</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                     <Clock className="w-3 h-3" /> {new Date(session.scheduledDate || session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleStartSession(session._id || session.id, session.meetLink)}
                           className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm"
                         >
                            Launch
                         </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
                       <p className="text-xs font-bold uppercase tracking-widest">No classes for this week</p>
                    </div>
                  )}
               </div>
            </motion.div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h3 className="text-xl font-black mb-1">Impact Summary</h3>
                  <p className="text-xs text-indigo-300 font-medium mb-8">Your contribution this semester.</p>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-200">
                           <span>Curriculum Progress</span>
                           <span>82%</span>
                        </div>
                        <div className="h-2 w-full bg-indigo-500/20 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-200">
                           <span>Student Attendance</span>
                           <span>95%</span>
                        </div>
                        <div className="h-2 w-full bg-indigo-500/20 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: '95%' }} className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/10">
                     <button onClick={() => navigate('/volunteer/test-results')} className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors group">
                        Student Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-8 border-slate-100 shadow-sm">
                <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                   <Star className="w-4 h-4 text-amber-500" /> Community Badges
                </h4>
                <div className="flex flex-wrap gap-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:border-blue-100 hover:shadow-md transition-all cursor-pointer">
                        <TrophySmall className="w-6 h-6" />
                     </div>
                   ))}
                </div>
                <button 
                  onClick={() => navigate('/volunteer/learning-path')}
                  className="w-full mt-8 py-3 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  View My Credentials
                </button>
            </motion.div>
         </div>
      </section>
    </motion.div>
  )
}

// Small icon component
const TrophySmall = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export default VolunteerDashboard
