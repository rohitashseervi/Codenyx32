import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Calendar, Clock, Plus, User } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Schedule = () => {
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    time: '',
    topic: '',
    agenda: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch both sessions and available students
        const [sessionsRes, studentsRes] = await Promise.all([
          api.mentor.getStudents(), // Can be adapted to fetch sessions
          api.mentor.getStudents(),
        ])
        setStudents(studentsRes.data.students || [])
        setSessions(
          sessionsRes.data.students?.flatMap((s) => s.sessions || []).sort((a, b) =>
            new Date(b.date) - new Date(a.date)
          ) || []
        )
      } catch (err) {
        console.error('Failed to fetch data:', err)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.mentor.scheduleMeet({
        studentId: formData.studentId,
        date: formData.date,
        time: formData.time,
        topic: formData.topic,
        agenda: formData.agenda,
      })
      toast.success('Session scheduled successfully!')
      setFormData({ studentId: '', date: '', time: '', topic: '', agenda: '' })
      setShowForm(false)
      // Refresh sessions
      const res = await api.mentor.getStudents()
      setSessions(res.data.students?.flatMap((s) => s.sessions || []) || [])
    } catch (err) {
      console.error('Failed to schedule:', err)
      toast.error('Failed to schedule session')
    }
  }

  if (loading) return <LoadingSpinner message="Loading schedule..." />

  const upcomingSessions = sessions.filter((s) => new Date(s.date) > new Date())
  const pastSessions = sessions.filter((s) => new Date(s.date) <= new Date()).reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Schedule</h1>
          <p className="text-gray-600">Manage and schedule 1-on-1 sessions with your students</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div className="card border-2 border-primary-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule New Session</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Select */}
              <div>
                <label className="label">Select Student</label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Grade {student.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="label">Topic/Subject</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Math - Fractions"
                  className="input-field"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="label">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Agenda */}
            <div>
              <label className="label">Agenda/Notes</label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleInputChange}
                placeholder="What will you focus on in this session?"
                className="input-field resize-none"
                rows="3"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button type="submit" className="flex-1 btn-primary">
                Schedule Session
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Upcoming Sessions ({upcomingSessions.length})
          </h2>
          <div className="space-y-3">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 border border-primary-200 bg-primary-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{session.studentName || 'Student'}</h3>
                  <p className="text-sm text-gray-600 mt-1">{session.topic}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.time}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 btn-secondary text-sm">Join Meet</button>
                    <button className="flex-1 btn-secondary text-sm">Reschedule</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No upcoming sessions</p>
            )}
          </div>
        </div>

        {/* Past Sessions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Past Sessions ({pastSessions.length})</h2>
          <div className="space-y-3">
            {pastSessions.length > 0 ? (
              pastSessions.map((session) => (
                <div key={session.id} className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{session.studentName || 'Student'}</h3>
                  <p className="text-sm text-gray-600 mt-1">{session.topic}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {session.status || 'Completed'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No past sessions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schedule
