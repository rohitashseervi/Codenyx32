import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, BookOpen, Award, Zap, CheckCircle2, Trophy, ArrowRight, Bell } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    streak: 0,
    todayClasses: [],
    pendingTests: [],
    recentBadges: [],
    masteredTopics: 0,
    totalTopics: 0,
    averageScore: 0,
  })

  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [classesRes, testsRes, progressRes, badgesRes, notifRes] = await Promise.all([
          api.student.getClasses({ today: true }),
          api.student.getTests({ status: 'pending' }),
          api.student.getProgress(),
          api.student.getBadges(),
          api.communication.getNotifications()
        ])

        setDashboardData({
          streak: progressRes.data.streak || 0,
          todayClasses: (classesRes.data.classes || []).slice(0, 2),
          pendingTests: testsRes.data.tests || [],
          recentBadges: badgesRes.data.badges?.filter((b) => b.earnedAt).slice(0, 3) || [],
          masteredTopics: progressRes.data.masteredTopics || 0,
          totalTopics: progressRes.data.totalTopics || 0,
          averageScore: progressRes.data.averageScore || 0,
        })
        setNotifications(notifRes.data.notifications || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner message="Preparing your learning journey..." />

  const firstName = profile?.displayName?.split(' ')[0] || profile?.name?.split(' ')[0] || 'Friend'
  const masteryPercentage = dashboardData.totalTopics > 0
    ? Math.round((dashboardData.masteredTopics / dashboardData.totalTopics) * 100)
    : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
      {/* Premium Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200/50"
        >
          <div className="relative z-10">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            >
              School Year 2024
            </motion.span>
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
              Keep it up, <span className="text-blue-200">{firstName}!</span> 🚀
            </h1>
            <p className="text-xl text-blue-100 max-w-md leading-relaxed">
              You've completed <span className="font-bold text-white">{masteryPercentage}%</span> of your syllabus. 
              The target for this month is 80%.
            </p>
            <div className="mt-10 flex gap-4">
              <button onClick={() => navigate('/student/classes')} className="px-8 py-3.5 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
                Launch Classes <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/student/tests')} className="px-8 py-3.5 bg-blue-500/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors">
                View Tests
              </button>
            </div>
          </div>
          {/* Abstract Bg decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
             <div className="w-32 h-32 rounded-full border-[10px] border-slate-50 flex items-center justify-center">
                <div className="text-center">
                   <p className="text-4xl font-extrabold text-slate-800">{dashboardData.streak}</p>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Day Streak</p>
                </div>
             </div>
             <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-12">
                <Flame className="w-7 h-7 fill-white" />
             </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Immortal Streak!</h3>
          <p className="text-sm text-slate-500">You're in the top 5% of active students this week.</p>
        </motion.div>
      </section>

      {/* Grid of Content */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Learning activities */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Upcoming Classes Horizontal */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-blue-600" />
                Live Sessions
              </h2>
              <button 
                onClick={() => navigate('/student/classes')}
                className="group flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Full Schedule <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardData.todayClasses.length > 0 ? (
                dashboardData.todayClasses.map((cls) => (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    key={cls.id} 
                    className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {cls.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Today {cls.time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{cls.topic}</h3>
                    <p className="text-sm text-slate-500 mb-6 italic">with {cls.volunteerName}</p>
                    <button 
                      onClick={() => window.open(cls.meetLink, '_blank')}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors"
                    >
                      <Zap className="w-4 h-4 fill-white" /> Join Meeting
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                   <p className="text-sm font-bold">No classes scheduled for today.</p>
                   <p className="text-xs">Take this time to review recorded sessions.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress Chart or Map placeholder */}
          <motion.div variants={itemVariants} className="card p-8 bg-slate-900 text-white">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black mb-2">Learning Path</h3>
                <p className="text-slate-400 text-sm">Path to Mastery: Fundamental Sciences</p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <div className="relative py-4">
               <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${masteryPercentage}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  ></motion.div>
               </div>
               <div className="flex justify-between relative px-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 border-slate-900 shadow-xl ${i <= (masteryPercentage/20) ? 'bg-blue-500 scale-125' : 'bg-slate-700'}`}></div>
                  ))}
               </div>
            </div>
            <div className="mt-8 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
               <span>Intro</span>
               <span>Mastery</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Achievements & Stats */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Daily Goals */}
          <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-100/50">
             <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
               <CheckCircle2 className="w-6 h-6 text-emerald-500" />
               Daily Goals
             </h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                   <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-emerald-500 bg-white"></div>
                   <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Attend Science Class</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                   <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-emerald-500 bg-white"></div>
                   <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Complete Quiz #04</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-emerald-500/30 bg-emerald-50 transition-all opacity-60">
                   <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                   </div>
                   <span className="text-sm font-bold text-emerald-700 line-through">Mark Attendance</span>
                </div>
             </div>
          </motion.div>

          {/* Recent Badges Overlay */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2rem] p-8 text-white relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black">Latest Trophies</h3>
                  <Award className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-4">
                  {dashboardData.recentBadges.length > 0 ? (
                    dashboardData.recentBadges.map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-white/10 rounded-2xl border border-white/10">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-white/20">
                           <Zap className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-indigo-300 tracking-wider">New Badge</p>
                          <p className="text-sm font-bold">{badge.name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-indigo-300/60 font-medium py-4 text-center">Solve quizes to unlock secret badges!</p>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/student/badges')}
                  className="w-full mt-6 py-3.5 bg-indigo-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  View Collection
                </button>
             </div>
             {/* bg flare */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          </motion.div>

          {/* Quick Notifications Tray */}
          <motion.div variants={itemVariants} className="card p-6 border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Alerts
                </h4>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
             </div>
             <div className="space-y-3">
                {notifications.length > 0 ? (
                   notifications.slice(0, 3).map((n) => (
                      <div key={n._id} className="p-3 bg-slate-50 rounded-xl text-[11px] font-medium text-slate-600 border border-slate-100">
                         {n.message}
                      </div>
                   ))
                ) : (
                   <p className="text-[11px] text-slate-400 italic">No new notifications</p>
                )}
             </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default StudentDashboard
