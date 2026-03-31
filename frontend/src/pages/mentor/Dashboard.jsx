import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Users, AlertCircle, Clock, BookOpen } from 'lucide-react'
import StatsCard from '../../components/common/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { profile } = useAuth()
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

        // Fetch students
        const studentsRes = await api.mentor.getStudents()
        const students = studentsRes.data?.students || studentsRes.data?.data || []

        // Fetch alerts
        const alertsRes = await api.mentor.getAlerts()
        const alerts = alertsRes.data?.alerts || alertsRes.data?.data || []

        setDashboardData({
          studentsAssigned: students.length,
          maxStudents: 5,
          upcomingSessions: Math.floor(Math.random() * 5) + 1, // Placeholder
          alerts: alerts.slice(0, 5),
          students: students.slice(0, 5),
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />
  if (error) {
    return (
      <div className="card bg-danger-50 border-2 border-danger-200 text-center">
        <AlertCircle className="w-8 h-8 text-danger-600 mx-auto mb-2" />
        <p className="text-danger-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.name?.split(' ')[0] || 'Mentor'}!
        </h1>
        <p className="text-gray-600 mt-2">
          You are helping students grow and succeed. Great work!
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="Students Assigned"
          value={`${dashboardData.studentsAssigned}/${dashboardData.maxStudents}`}
          color="primary"
        />
        <StatsCard
          icon={Clock}
          label="Upcoming Sessions"
          value={dashboardData.upcomingSessions}
          color="secondary"
        />
        <StatsCard
          icon={AlertCircle}
          label="Active Alerts"
          value={dashboardData.alerts.length}
          color="danger"
        />
        <StatsCard
          icon={BookOpen}
          label="Avg Student Score"
          value="72%"
          color="success"
        />
      </div>

      {/* Students Row */}
      {dashboardData.students.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.students.map((student) => (
              <div key={student.id} className="card-hover border-2 border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">Grade {student.grade}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    student.status === 'active'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {student.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-600">Latest Test Score</p>
                    <p className="text-lg font-bold text-primary-600">{student.latestScore || 'N/A'}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 btn-secondary text-sm">Schedule Meet</button>
                  <button className="flex-1 btn-secondary text-sm">View Progress</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {dashboardData.alerts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-danger-50 rounded-lg border border-danger-200">
                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{alert.studentName || 'Student'}</p>
                  <p className="text-sm text-gray-600">
                    Scored {alert.score}% on {alert.topic} - {alert.date ? new Date(alert.date).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <button className="btn-primary text-sm whitespace-nowrap">Schedule Meet</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {dashboardData.students.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Yet</h3>
          <p className="text-gray-600 mb-4">You haven't been assigned any students yet.</p>
          <a href="/mentor/browse-ngos" className="btn-primary">
            Join an NGO to Get Started
          </a>
        </div>
      )}
    </div>
  )
}

export default Dashboard
