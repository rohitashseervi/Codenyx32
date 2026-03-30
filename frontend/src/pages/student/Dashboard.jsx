import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { Flame, BookOpen, Award, Zap } from 'lucide-react'
import StreakCounter from '../../components/common/StreakCounter'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [classesRes, testsRes, progressRes, badgesRes] = await Promise.all([
          api.student.getClasses({ today: true }),
          api.student.getTests({ status: 'pending' }),
          api.student.getProgress(),
          api.student.getBadges(),
        ])

        setDashboardData({
          streak: progressRes.data.streak || 0,
          todayClasses: classesRes.data.classes || [],
          pendingTests: testsRes.data.tests || [],
          recentBadges: badgesRes.data.badges?.filter((b) => b.earned).slice(0, 3) || [],
          masteredTopics: progressRes.data.masteredTopics || 0,
          totalTopics: progressRes.data.totalTopics || 0,
          averageScore: progressRes.data.averageScore || 0,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  const firstName = profile?.name?.split(' ')[0] || 'Friend'
  const masteryPercentage = dashboardData.totalTopics > 0
    ? Math.round((dashboardData.masteredTopics / dashboardData.totalTopics) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Big Greeting */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Hi {firstName}! 🌟</h1>
        <p className="text-lg opacity-90">Welcome back! Keep up the amazing work!</p>
      </div>

      {/* Streak Counter - Prominent Display */}
      <div className="card border-4 border-accent-200 bg-accent-50">
        <div className="flex items-center justify-center gap-4">
          <Flame className="w-12 h-12 text-accent-600" />
          <div>
            <p className="text-gray-600 font-medium">Current Streak</p>
            <p className="text-5xl font-bold text-accent-600">{dashboardData.streak}</p>
            <p className="text-sm text-gray-600">Keep it going! 🔥</p>
          </div>
        </div>
      </div>

      {/* Today's Classes */}
      {dashboardData.todayClasses.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            Today's Classes
          </h2>
          <div className="space-y-3">
            {dashboardData.todayClasses.map((cls) => (
              <div key={cls.id} className="card border-2 border-primary-200 bg-primary-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{cls.subject}</h3>
                    <p className="text-sm text-gray-600">{cls.topic}</p>
                  </div>
                  <span className="text-sm font-medium text-primary-700 bg-white px-3 py-1 rounded-full">
                    {cls.time}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4">With {cls.volunteerName}</p>
                <button
                  onClick={() => {
                    window.open(cls.meetLink, '_blank')
                  }}
                  className="btn-primary w-full text-lg py-3"
                >
                  Join Class Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tests */}
      {dashboardData.pendingTests.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Pending Tests
          </h2>
          <div className="space-y-3">
            {dashboardData.pendingTests.map((test) => (
              <div key={test.id} className="card border-2 border-yellow-200 bg-yellow-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{test.topic}</h3>
                    <p className="text-sm text-gray-600">{test.subject}</p>
                  </div>
                  <span className="text-sm font-medium text-yellow-700 bg-white px-3 py-1 rounded-full">
                    {test.difficulty}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/student/tests/${test.id}/take`)}
                  className="btn-primary w-full text-lg py-3 bg-yellow-600 hover:bg-yellow-700"
                >
                  Take Test Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mastery Progress */}
        <div className="card border-2 border-success-200 bg-success-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#e0e7ff"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${(masteryPercentage / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-success-700">{masteryPercentage}%</p>
                <p className="text-xs text-gray-600">Mastered</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-700">
            You've mastered {dashboardData.masteredTopics} out of {dashboardData.totalTopics} topics!
          </p>
        </div>

        {/* Recent Badges */}
        <div className="card border-2 border-accent-200 bg-accent-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent-600" />
            Recent Badges
          </h3>
          <div className="space-y-3">
            {dashboardData.recentBadges.length > 0 ? (
              dashboardData.recentBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                  <Award className="w-6 h-6 text-accent-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-4">Keep working to earn badges! 🏆</p>
            )}
          </div>
          <button
            onClick={() => navigate('/student/badges')}
            className="btn-secondary w-full mt-4"
          >
            View All Badges
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/student/classes')}
          className="card-hover bg-blue-50 border-2 border-blue-200 text-center py-6"
        >
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">My Classes</p>
        </button>
        <button
          onClick={() => navigate('/student/tests')}
          className="card-hover bg-yellow-50 border-2 border-yellow-200 text-center py-6"
        >
          <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Tests</p>
        </button>
        <button
          onClick={() => navigate('/student/progress')}
          className="card-hover bg-green-50 border-2 border-green-200 text-center py-6"
        >
          <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Progress</p>
        </button>
      </div>
    </div>
  )
}

export default StudentDashboard
