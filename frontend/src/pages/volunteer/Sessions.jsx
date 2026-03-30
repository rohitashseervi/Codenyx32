import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Calendar, List, Play, CheckCircle, Plus, Eye } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Sessions = () => {
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'upcoming', 'past', 'all'
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await api.volunteer.getSessions({ status: filter })
      setSessions(response.data.data || response.data || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async (sessionId) => {
    try {
      await api.volunteer.startSession(sessionId)
      toast.success('Session started! Redirecting to Google Meet...')
      // In real implementation, redirect to Google Meet URL from response
    } catch (error) {
      console.error('Failed to start session:', error)
      toast.error('Failed to start session')
    }
  }

  const handleMarkComplete = async (sessionId) => {
    try {
      await api.volunteer.completeSession(sessionId, { completedAt: new Date() })
      toast.success('Session marked as complete!')
      fetchSessions()
    } catch (error) {
      console.error('Failed to complete session:', error)
      toast.error('Failed to mark session as complete')
    }
  }

  const handleCreateTest = (sessionId) => {
    // Navigate to create test page with session context
    window.location.href = `/volunteer/create-test?sessionId=${sessionId}`
  }

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800 border border-blue-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      completed: 'bg-green-100 text-green-800 border border-green-300',
      cancelled: 'bg-gray-100 text-gray-800 border border-gray-300',
    }
    return colors[status] || colors.upcoming
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-50 text-blue-700',
      'in-progress': 'bg-yellow-50 text-yellow-700',
      completed: 'bg-green-50 text-green-700',
      cancelled: 'bg-gray-50 text-gray-700',
    }
    return colors[status] || colors.upcoming
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming')
  const pastSessions = sessions.filter((s) => s.status === 'completed')

  // Calendar view helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedMonth)
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getSessionsForDate = (day) => {
    return sessions.filter((s) => {
      const sessionDate = new Date(s.scheduledDate || s.date)
      return (
        sessionDate.getDate() === day &&
        sessionDate.getMonth() === selectedMonth.getMonth() &&
        sessionDate.getFullYear() === selectedMonth.getFullYear()
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-1">Manage your teaching sessions</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'upcoming', 'past'].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session._id || session.id} className="card border-l-4 border-blue-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.topic || 'Class Session'}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadgeColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          📅{' '}
                          {new Date(session.scheduledDate || session.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(session.scheduledDate || session.date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Class: {session.classGroup || 'N/A'} • {session.studentCount || 0} students
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStartSession(session._id || session.id)}
                          className="btn btn-primary flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Start
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Sessions</h2>
              <div className="space-y-3">
                {pastSessions.map((session) => (
                  <div key={session._id || session.id} className="card border-l-4 border-green-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.topic || 'Class Session'}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadgeColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          📅{' '}
                          {new Date(session.scheduledDate || session.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Class: {session.classGroup || 'N/A'} • {session.studentCount || 0} students
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!session.testCreated && (
                          <button
                            onClick={() => handleCreateTest(session._id || session.id)}
                            className="btn btn-outline flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create Test
                          </button>
                        )}
                        {session.testCreated && (
                          <button className="btn btn-outline flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View Results
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No sessions found</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="card">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const prev = new Date(selectedMonth)
                  prev.setMonth(prev.getMonth() - 1)
                  setSelectedMonth(prev)
                }}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                ← Prev
              </button>
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const next = new Date(selectedMonth)
                  next.setMonth(next.getMonth() + 1)
                  setSelectedMonth(next)
                }}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day)
              const daySessions = getSessionsForDate(day)
              const isToday =
                dayDate.getDate() === new Date().getDate() &&
                dayDate.getMonth() === new Date().getMonth() &&
                dayDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 border rounded-lg ${
                    isToday ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-200'
                  } hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <p className={`font-semibold text-sm mb-1 ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                    {day}
                  </p>
                  {daySessions.length > 0 && (
                    <div className="space-y-1">
                      {daySessions.slice(0, 2).map((s, i) => (
                        <div
                          key={i}
                          className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded truncate hover:bg-blue-600"
                        >
                          {s.topic || 'Class'}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-gray-600 px-2">
                          +{daySessions.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sessions
