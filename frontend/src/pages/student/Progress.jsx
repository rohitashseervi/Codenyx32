import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Flame, Award, TrendingUp } from 'lucide-react'
import MasteryMap from '../../components/common/MasteryMap'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Progress = () => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const response = await api.student.getProgress()
        setProgress(response.data)
      } catch (err) {
        console.error('Failed to fetch progress:', err)
        toast.error('Failed to load progress')
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  if (loading) return <LoadingSpinner message="Loading your progress..." />
  if (!progress) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Unable to load progress data</p>
      </div>
    )
  }

  const overallMastery = progress.overallMastery || 0
  const chartData = progress.scoreHistory?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.score,
  })) || []

  const subjectData = progress.subjectMastery?.map((subject) => ({
    name: subject.name,
    mastery: subject.percentage,
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary-600" />
          Your Progress
        </h1>
        <p className="text-gray-600 text-lg">Track your learning journey and celebrate wins!</p>
      </div>

      {/* Overall Mastery Circle */}
      <div className="card border-4 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Overall Mastery</h2>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e0e7ff"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeDasharray={`${(overallMastery / 100) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold text-primary-700">{overallMastery}%</p>
              <p className="text-sm text-gray-600">Mastered</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Topics Mastered</p>
            <p className="text-3xl font-bold text-primary-600">{progress.masteredTopics || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-3xl font-bold text-accent-600 flex items-center justify-center gap-1">
              <Flame className="w-6 h-6" />
              {progress.streak || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Score</p>
            <p className="text-3xl font-bold text-success-600">{Math.round(progress.averageScore || 0)}%</p>
          </div>
        </div>
      </div>

      {/* Subject-wise Mastery Bars */}
      {subjectData.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject-wise Mastery</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="mastery" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Subject Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {subjectData.map((subject) => (
              <div key={subject.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-900">{subject.name}</p>
                  <p className="text-lg font-bold text-primary-600">{subject.mastery}%</p>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${subject.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Trend Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Test Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mastery Map */}
      <MasteryMap topics={progress.topics || []} />

      {/* Badges Section */}
      {progress.badges && (progress.badges.earned?.length > 0 || progress.badges.locked?.length > 0) && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent-600" />
            Badges
          </h2>

          {/* Earned Badges */}
          {progress.badges.earned?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Earned Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {progress.badges.earned.map((badge, idx) => (
                  <Badge
                    key={idx}
                    name={badge.name}
                    description={badge.description}
                    dateEarned={badge.earnedDate}
                    color="success"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          {progress.badges.locked?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 Locked Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                {progress.badges.locked.map((badge, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-gray-300 rounded-xl p-4 bg-gray-50"
                  >
                    <p className="font-semibold text-gray-700">{badge.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{badge.requirement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Encouragement Message */}
      <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
        <p className="text-lg text-center text-gray-900">
          {overallMastery >= 80
            ? '🌟 Excellent work! You are a master learner!'
            : overallMastery >= 60
              ? '💪 Great progress! Keep pushing forward!'
              : overallMastery >= 40
                ? '📈 You are on the right track! Stay consistent!'
                : '🚀 Every step counts. You got this!'}
        </p>
      </div>
    </div>
  )
}

export default Progress
