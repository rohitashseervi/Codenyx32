import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { ArrowLeft, Star, TrendingUp, Calendar, Award } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import MasteryMap from '../../components/common/MasteryMap'
import StreakCounter from '../../components/common/StreakCounter'
import toast from 'react-hot-toast'

const StudentDetail = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const ngoId = profile?.ngoId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [student, setStudent] = useState(null)
  const [testHistory, setTestHistory] = useState([])
  const [progressTrend, setProgressTrend] = useState([])

  useEffect(() => {
    if (!ngoId || !studentId) return

    const fetchStudentData = async () => {
      try {
        setLoading(true)
        setError(null)

        // In a real app, you would fetch specific student data
        // For now, we'll use mock data structure
        const studentResponse = await api.ngo.getStudents(ngoId, { studentId })

        setStudent({
          id: studentId,
          name: 'Raj Kumar',
          grade: 3,
          school: 'St. Mary School',
          language: 'Hindi',
          masteryScore: 72,
          status: 'on-track',
          assignedMentor: 'Priya Sharma',
          mentorEmail: 'priya@example.com',
          consistencyStreak: 15,
          totalTests: 24,
          averageScore: 72.5,
          topics: [
            { name: 'Addition', level: 'mastered', percentage: 95 },
            { name: 'Subtraction', level: 'proficient', percentage: 85 },
            { name: 'Multiplication', level: 'learning', percentage: 65 },
            { name: 'Division', level: 'learning', percentage: 55 },
            { name: 'Fractions', level: 'not-started', percentage: 0 },
            { name: 'Geometry', level: 'not-started', percentage: 0 },
          ],
          badges: ['Quick Learner', 'Consistent Performer', 'Problem Solver'],
        })

        // Mock test history
        setTestHistory([
          { id: 1, date: '2024-03-28', topic: 'Addition', score: 95, masteryLevel: 'Mastered' },
          { id: 2, date: '2024-03-27', topic: 'Subtraction', score: 82, masteryLevel: 'Proficient' },
          { id: 3, date: '2024-03-26', topic: 'Multiplication', score: 68, masteryLevel: 'Learning' },
          { id: 4, date: '2024-03-25', topic: 'Addition', score: 92, masteryLevel: 'Mastered' },
          { id: 5, date: '2024-03-24', topic: 'Division', score: 55, masteryLevel: 'Learning' },
        ])

        // Mock progress trend
        setProgressTrend([
          { date: 'Mar 24', score: 68 },
          { date: 'Mar 25', score: 70 },
          { date: 'Mar 26', score: 68 },
          { date: 'Mar 27', score: 72 },
          { date: 'Mar 28', score: 75 },
        ])
      } catch (err) {
        console.error('Failed to fetch student data:', err)
        setError('Failed to load student details. Please try again.')
        toast.error('Failed to load student details')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [ngoId, studentId])

  if (loading) {
    return <LoadingSpinner message="Loading student details..." />
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/ngo_admin/students')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Students</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Student not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800'
      case 'developing':
        return 'bg-yellow-100 text-yellow-800'
      case 'at-risk':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMasteryColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 65) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <button
          onClick={() => navigate('/ngo_admin/students')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Students</span>
        </button>

        {/* Student Info Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-gray-600">Grade {student.grade}</span>
                    <span className="text-gray-600">{student.school}</span>
                    <span className="text-gray-600">{student.language}</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.status)}`}>
                      {student.status === 'on-track' ? 'On Track' : student.status === 'developing' ? 'Developing' : 'At Risk'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getMasteryColor(student.masteryScore)}`}>
                {(student.masteryScore || 0).toFixed(0)}%
              </div>
              <p className="text-gray-600 mt-2">Overall Mastery</p>
            </div>
          </div>

          {/* Mentor Info */}
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Assigned Mentor</p>
            <p className="font-semibold text-gray-900">{student.assignedMentor}</p>
            <p className="text-sm text-gray-600">{student.mentorEmail}</p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">{(student.averageScore || 0).toFixed(1)}%</p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <Calendar className="w-8 h-8 text-secondary-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Tests</p>
            <p className="text-3xl font-bold text-gray-900">{student.totalTests || 0}</p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <Award className="w-8 h-8 text-accent-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Badges Earned</p>
            <p className="text-3xl font-bold text-gray-900">{student.badges?.length || 0}</p>
          </div>

          <div className="card">
            <StreakCounter streak={student.consistencyStreak || 0} />
          </div>
        </div>

        {/* Mastery Map */}
        <div className="mb-6">
          <MasteryMap topics={student.topics || []} />
        </div>

        {/* Progress Trend */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Trend</h3>
          {progressTrend && progressTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Test History */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mastery Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {testHistory && testHistory.length > 0 ? (
                  testHistory.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{test.date}</td>
                      <td className="px-4 py-3 text-gray-900">{test.topic}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${test.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{test.score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          test.masteryLevel === 'Mastered' ? 'bg-green-100 text-green-800' :
                          test.masteryLevel === 'Proficient' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {test.masteryLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No tests taken yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges */}
        {student.badges && student.badges.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges Earned</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {student.badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                  <span className="font-medium text-gray-900">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDetail
