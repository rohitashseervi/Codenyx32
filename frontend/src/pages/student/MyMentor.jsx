import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { User, Mail, Phone, Calendar, MessageCircle, Plus } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const MyMentor = () => {
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [pastSessions, setPastSessions] = useState([])

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true)
        const response = await api.student.getMentor()
        setMentor(response.data.mentor || null)
        setPastSessions(response.data.sessions || [])
      } catch (err) {
        console.error('Failed to fetch mentor data:', err)
        if (err.response?.status !== 404) {
          toast.error('Failed to load mentor information')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMentorData()
  }, [])

  const handleRequestMentor = async () => {
    try {
      await api.student.requestMentor({ reason: 'Looking for a mentor' })
      toast.success('Mentor request sent! We will match you soon.')
      setShowRequestDialog(false)
    } catch (err) {
      console.error('Failed to request mentor:', err)
      toast.error('Failed to send mentor request')
    }
  }

  if (loading) return <LoadingSpinner message="Loading mentor info..." />

  if (!mentor) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentor</h1>
          <p className="text-gray-600">Get personalized guidance from an experienced mentor</p>
        </div>

        {/* No Mentor State */}
        <div className="card text-center py-16 bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-200">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Mentor Yet</h2>
          <p className="text-gray-600 mb-6 text-lg">
            A mentor will provide personalized support for your learning journey.
          </p>
          <button
            onClick={() => setShowRequestDialog(true)}
            className="btn-primary text-lg py-3 px-8 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Request a Mentor
          </button>
        </div>

        {/* Request Dialog */}
        {showRequestDialog && (
          <div className="card border-2 border-primary-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request a Mentor</h3>
            <p className="text-gray-600 mb-6">
              We'll match you with an experienced mentor who can help you achieve your goals.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRequestMentor}
                className="flex-1 btn-primary"
              >
                Confirm Request
              </button>
              <button
                onClick={() => setShowRequestDialog(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Mentor</h1>
        <p className="text-gray-600">Meet your personalized guide</p>
      </div>

      {/* Mentor Card */}
      <div className="card border-4 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{mentor.name}</h2>
            <p className="text-primary-600 font-medium">{mentor.title || 'Mentor'}</p>
          </div>
          <button
            onClick={() => {
              toast.info('Change mentor request submitted')
            }}
            className="btn-secondary"
          >
            Request Change
          </button>
        </div>

        {/* Mentor Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
          {mentor.email && (
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{mentor.email}</p>
              </div>
            </div>
          )}
          {mentor.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{mentor.phone}</p>
              </div>
            </div>
          )}
          {mentor.expertise && (
            <div className="flex items-start gap-3 col-span-full md:col-span-1">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="text-sm text-gray-600">Expertise</p>
                <p className="font-medium text-gray-900">{mentor.expertise}</p>
              </div>
            </div>
          )}
          {mentor.bio && (
            <div className="flex items-start gap-3 col-span-full md:col-span-1">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm text-gray-600">About</p>
                <p className="font-medium text-gray-900">{mentor.bio}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              toast.info('Opening chat...')
            }}
            className="flex-1 btn-primary text-lg py-3 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Mentor
          </button>
          <button
            onClick={() => {
              toast.info('Opening schedule...')
            }}
            className="flex-1 btn-secondary text-lg py-3"
          >
            Schedule Session
          </button>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {mentor.upcomingSessions && mentor.upcomingSessions.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Upcoming Sessions
          </h3>
          <div className="space-y-3">
            {mentor.upcomingSessions.map((session, index) => (
              <div key={index} className="p-4 border border-primary-200 bg-primary-50 rounded-lg">
                <p className="font-medium text-gray-900">{session.topic}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(session.date).toLocaleDateString()} at {session.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Past Sessions</h3>
          <div className="space-y-3">
            {pastSessions.map((session, index) => (
              <div key={index} className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{session.topic}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(session.date).toLocaleDateString()} • {session.notes || 'Session completed'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="card bg-yellow-50 border-2 border-yellow-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Tips for Working with Your Mentor</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span>Ask questions freely - there are no silly questions!</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span>Share your learning goals with your mentor</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span>Be consistent with scheduled sessions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span>Give feedback to help improve sessions</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MyMentor
