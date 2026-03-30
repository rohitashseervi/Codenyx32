import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Clock, Users, TrendingUp, FileText, ChevronRight, Calendar } from 'lucide-react'
import StatsCard from '../../components/common/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { profile } = useAuth()
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

      const allSessions = sessionsRes.data.data || sessionsRes.data || []
      setSessions(allSessions)

      // Get upcoming sessions (next 7 days)
      const upcoming = allSessions
        .filter((s) => {
          const sessionDate = new Date(s.scheduledDate || s.date)
          const today = new Date()
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          return sessionDate >= today && sessionDate <= nextWeek && s.status !== 'completed'
        })
        .sort((a, b) => new Date(a.scheduledDate || a.date) - new Date(b.scheduledDate || b.date))
        .slice(0, 3)

      setUpcomingSessions(upcoming)

      // Mock stats - replace with actual API when available
      setStats({
        totalSessions: allSessions.filter((s) => s.status === 'completed').length,
        studentsTeaching: 24,
        avgStudentScore: 78.5,
        testsCreated: 8,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async (sessionId) => {
    try {
      await api.volunteer.startSession(sessionId)
      toast.success('Session started! Opening Google Meet...')
      // Redirect to Google Meet - implementation depends on backend
    } catch (error) {
      console.error('Failed to start session:', error)
      toast.error('Failed to start session')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name || 'Volunteer'}!</h1>
        <p className="text-blue-100">You're making a difference in students' lives today.</p>
      </div>

      {/* Today's Session Card */}
      {upcomingSessions.length > 0 && (
        <div className="card border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Today's Session</h3>
              </div>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">{upcomingSessions[0].topic || 'Math Class'}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Time: {new Date(upcomingSessions[0].scheduledDate || upcomingSessions[0].date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {upcomingSessions[0].studentCount || 0} students
                </span>
              </div>
              <button
                onClick={() => handleStartSession(upcomingSessions[0]._id || upcomingSessions[0].id)}
                className="btn btn-primary"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Clock}
            label="Total Sessions Completed"
            value={stats.totalSessions}
            color="primary"
          />
          <StatsCard
            icon={Users}
            label="Students Teaching"
            value={stats.studentsTeaching}
            color="secondary"
          />
          <StatsCard icon={TrendingUp} label="Avg Student Score" value={`${stats.avgStudentScore}%`} color="accent" />
          <StatsCard icon={FileText} label="Tests Created" value={stats.testsCreated} color="success" />
        </div>
      )}

      {/* Upcoming Sessions This Week */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">This Week's Schedule</h2>
          <a href="/volunteer/sessions" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Calendar View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-6">
          {weekDays.map((date) => {
            const daySession = upcomingSessions.find((s) => {
              const sDate = new Date(s.scheduledDate || s.date)
              return (
                sDate.getDate() === date.getDate() &&
                sDate.getMonth() === date.getMonth() &&
                sDate.getFullYear() === date.getFullYear()
              )
            })

            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()

            return (
              <div
                key={date.toISOString()}
                className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                  isToday
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : daySession
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <p className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-900'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                  {date.getDate()}
                </p>
                {daySession && <p className="text-xs mt-1 truncate">1 session</p>}
              </div>
            )
          })}
        </div>

        {/* Sessions List */}
        {upcomingSessions.length > 0 ? (
          <div className="space-y-3">
            {upcomingSessions.map((session, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{session.topic || 'Class Session'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.scheduledDate || session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <button className="btn btn-sm btn-outline">Start</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No sessions scheduled for this week</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
