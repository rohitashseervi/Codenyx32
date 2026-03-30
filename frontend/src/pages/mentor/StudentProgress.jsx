import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, Award, Calendar, TrendingUp } from 'lucide-react'
import MasteryMap from '../../components/common/MasteryMap'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const StudentProgress = () => {
  const { studentId } = useParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const response = await api.mentor.getStudentProgress(studentId)
        setStudent(response.data)
      } catch (err) {
        console.error('Failed to fetch student progress:', err)
        setError('Failed to load student progress')
        toast.error('Failed to load student progress')
      } finally {
        setLoading(false)
      }
    }

    if (studentId) fetchProgress()
  }, [studentId])

  if (loading) return <LoadingSpinner message="Loading student progress..." />
  if (error) {
    return (
      <div className="card bg-danger-50 border-2 border-danger-200">
        <p className="text-danger-700">{error}</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Student not found</p>
      </div>
    )
  }

  const chartData = student.testHistory?.map((test) => ({
    date: new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: test.score,
  })) || []

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tests', label: 'Test History' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'notes', label: 'Notes' },
  ]

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Grade {student.grade}</span>
              <span>•</span>
              <span>{student.school}</span>
              <span>•</span>
              <span>{student.language}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="btn-primary">Schedule Meet</button>
            <button className="btn-secondary">Add Note</button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-xs text-primary-600 mb-1">Overall Mastery</p>
            <p className="text-3xl font-bold text-primary-700">{student.overallMastery || 0}%</p>
          </div>
          <div className="bg-accent-50 rounded-lg p-4">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-accent-600" />
              <p className="text-xs text-accent-600">Current Streak</p>
            </div>
            <p className="text-3xl font-bold text-accent-700">{student.streak || 0}</p>
          </div>
          <div className="bg-success-50 rounded-lg p-4">
            <p className="text-xs text-success-600 mb-1">Avg Test Score</p>
            <p className="text-3xl font-bold text-success-700">
              {student.averageTestScore ? Math.round(student.averageTestScore) : 'N/A'}%
            </p>
          </div>
          <div className="bg-warning-50 rounded-lg p-4">
            <p className="text-xs text-yellow-600 mb-1">Tests Taken</p>
            <p className="text-3xl font-bold text-yellow-700">{student.testsTaken || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Mastery Map */}
            <MasteryMap topics={student.topics || []} />

            {/* Score Trend */}
            {chartData.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Score Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Badges */}
            {student.badges && student.badges.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Badges Earned</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      icon={Award}
                      name={badge.name}
                      dateEarned={badge.earnedDate}
                      description={badge.description}
                      color="success"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-3">
            {student.testHistory && student.testHistory.length > 0 ? (
              student.testHistory.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{test.topic}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(test.date).toLocaleDateString()} • Difficulty: {test.difficulty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{test.score}%</p>
                    <p className="text-xs text-gray-600 mt-1">{test.masteryLevel}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No tests taken yet</p>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            {student.sessions && student.sessions.length > 0 ? (
              student.sessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{session.volunteerName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()} • {session.topic}
                      </p>
                    </div>
                  </div>
                  <span className="badge-success">{session.status}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No volunteer sessions yet</p>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {student.mentorNotes && student.mentorNotes.length > 0 ? (
              student.mentorNotes.map((note, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">{note.title}</p>
                    <p className="text-xs text-gray-600">{new Date(note.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-700">{note.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No notes added yet</p>
            )}
            <button className="btn-primary w-full">Add New Note</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentProgress
