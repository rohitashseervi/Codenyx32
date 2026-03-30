import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { BookOpen, Calendar, User, Clock, Play } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const MyClasses = () => {
  const [classes, setClasses] = useState({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const response = await api.student.getClasses()
        const allClasses = response.data.classes || []

        const now = new Date()
        setClasses({
          upcoming: allClasses.filter((cls) => new Date(cls.date) > now),
          past: allClasses.filter((cls) => new Date(cls.date) <= now).reverse(),
        })
      } catch (err) {
        console.error('Failed to fetch classes:', err)
        toast.error('Failed to load classes')
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  if (loading) return <LoadingSpinner message="Loading your classes..." />

  const ClassCard = ({ cls, isPast = false }) => (
    <div className="card-hover border-2 border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{cls.subject}</h3>
          <p className="text-gray-600">{cls.topic}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPast
            ? 'bg-gray-100 text-gray-700'
            : 'bg-primary-100 text-primary-700'
        }`}>
          {isPast ? 'Past' : 'Upcoming'}
        </span>
      </div>

      <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 text-gray-700">
          <User className="w-5 h-5 text-primary-600" />
          <span>{cls.volunteerName}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="w-5 h-5 text-primary-600" />
          <span>{new Date(cls.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Clock className="w-5 h-5 text-primary-600" />
          <span>{cls.time}</span>
        </div>
      </div>

      {!isPast && (
        <button
          onClick={() => {
            if (cls.meetLink) {
              window.open(cls.meetLink, '_blank')
            } else {
              toast.info('Meet link will be available 5 minutes before class')
            }
          }}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
        >
          <Play className="w-5 h-5" />
          Join Class
        </button>
      )}
      {isPast && (
        <div className="text-center py-3 text-gray-600">
          Class Completed
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary-600" />
          My Classes
        </h1>
        <p className="text-gray-600 text-lg">Learn with our amazing volunteers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium text-lg transition-colors ${
            activeTab === 'upcoming'
              ? 'text-primary-600 border-b-4 border-primary-600'
              : 'text-gray-600'
          }`}
        >
          📅 Upcoming ({classes.upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 font-medium text-lg transition-colors ${
            activeTab === 'past'
              ? 'text-primary-600 border-b-4 border-primary-600'
              : 'text-gray-600'
          }`}
        >
          ✓ Past ({classes.past.length})
        </button>
      </div>

      {/* Classes Grid */}
      {activeTab === 'upcoming' && (
        <div>
          {classes.upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.upcoming.map((cls) => (
                <ClassCard key={cls.id} cls={cls} isPast={false} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Classes</h3>
              <p className="text-gray-600">Check back soon for new classes!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          {classes.past.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.past.map((cls) => (
                <ClassCard key={cls.id} cls={cls} isPast={true} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Past Classes</h3>
              <p className="text-gray-600">You haven't attended any classes yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MyClasses
