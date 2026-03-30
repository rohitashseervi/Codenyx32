import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Award, TrendingUp, AlertTriangle, CheckCircle, Plus, FileText, Users2 } from 'lucide-react'
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

  // Sample colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  useEffect(() => {
    if (!ngoId) return

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch overview data
        const overviewResponse = await api.dashboard.overview(ngoId)
        const trendsResponse = await api.dashboard.trends(ngoId, { days: 30 })
        const subjectsResponse = await api.dashboard.subjects(ngoId)
        const atRiskResponse = await api.dashboard.atRisk(ngoId)

        setDashboardData({
          overview: overviewResponse.data,
          trends: trendsResponse.data,
          subjects: subjectsResponse.data,
          atRisk: atRiskResponse.data,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [ngoId])

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const overview = dashboardData?.overview || {}
  const trends = dashboardData?.trends || []
  const subjects = dashboardData?.subjects || []
  const atRisk = dashboardData?.atRisk || []

  // Prepare data for pie chart
  const statusDistribution = [
    { name: 'On Track', value: overview.onTrackStudents || 0, color: '#10b981' },
    { name: 'Developing', value: overview.developingStudents || 0, color: '#f59e0b' },
    { name: 'At Risk', value: overview.atRiskStudents || 0, color: '#ef4444' },
  ]

  // Calculate percentages
  const totalStudents = overview.totalStudents || 0
  const onTrackPercentage = totalStudents > 0 ? ((overview.onTrackStudents || 0) / totalStudents * 100).toFixed(0) : 0
  const atRiskPercentage = totalStudents > 0 ? ((overview.atRiskStudents || 0) / totalStudents * 100).toFixed(0) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
          <p className="text-gray-600 mt-2">{profile?.ngoName || 'Welcome to your dashboard'}</p>
        </div>

        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatsCard
            icon={Users}
            label="Total Students"
            value={overview.totalStudents || 0}
            color="primary"
          />
          <StatsCard
            icon={Users2}
            label="Active Volunteers"
            value={overview.activeVolunteers || 0}
            color="secondary"
          />
          <StatsCard
            icon={Award}
            label="Active Mentors"
            value={overview.activeMentors || 0}
            color="accent"
          />
        </div>

        {/* KPI Cards Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={TrendingUp}
            label="Avg Mastery Score"
            value={`${(overview.avgMasteryScore || 0).toFixed(1)}%`}
            color="success"
          />
          <StatsCard
            icon={AlertTriangle}
            label="At-Risk Students"
            value={overview.atRiskStudents || 0}
            trend={atRiskPercentage}
            trendDirection="down"
            color="danger"
          />
          <StatsCard
            icon={CheckCircle}
            label="Session Completion Rate"
            value={`${(overview.sessionCompletionRate || 0).toFixed(1)}%`}
            color="success"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mastery Trend Chart */}
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mastery Trend (30 Days)</h3>
            {trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="avgMastery" stroke="#3b82f6" name="Avg Mastery" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No trend data available
              </div>
            )}
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Status Distribution</h3>
            {statusDistribution.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} students`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No student data available
              </div>
            )}
          </div>
        </div>

        {/* Subject Performance & At-Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subject Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
            {subjects && subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No subject data available
              </div>
            )}
          </div>

          {/* At-Risk Students */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">At-Risk Students ({atRisk.length})</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {atRisk && atRisk.length > 0 ? (
                atRisk.slice(0, 5).map((student) => (
                  <div key={student.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Grade {student.grade} - {student.masteryScore}% mastery</p>
                      </div>
                      <Link
                        to={`/ngo_admin/students/${student.id}`}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No at-risk students</p>
              )}
            </div>
            {atRisk && atRisk.length > 5 && (
              <Link
                to="/ngo_admin/students"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium block mt-3"
              >
                View all at-risk students
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">New Student Enrolled</p>
                <p className="text-sm text-gray-600">5 students enrolled in the last 7 days</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Session Completed</p>
                <p className="text-sm text-gray-600">12 sessions completed with 85% average score</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Pending Approvals</p>
                <p className="text-sm text-gray-600">3 volunteers and 2 mentors awaiting approval</p>
              </div>
              <span className="text-xs text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/ngo_admin/students"
              className="flex items-center justify-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Student</span>
            </Link>
            <Link
              to="/ngo_admin/reports"
              className="flex items-center justify-center gap-2 p-4 bg-accent-50 hover:bg-accent-100 text-accent-600 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">View Reports</span>
            </Link>
            <Link
              to="/ngo_admin/volunteers"
              className="flex items-center justify-center gap-2 p-4 bg-secondary-50 hover:bg-secondary-100 text-secondary-600 rounded-lg transition-colors"
            >
              <Users2 className="w-5 h-5" />
              <span className="font-medium">Manage Volunteers</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NGODashboard
