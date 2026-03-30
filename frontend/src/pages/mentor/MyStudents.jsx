import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Search, Filter, Flame } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const MyStudents = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [sortBy, setSortBy] = useState('mastery')

  const subjects = ['all', 'Math', 'English', 'Science', 'Social Studies']

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await api.mentor.getStudents()
        setStudents(response.data.students || [])
      } catch (err) {
        console.error('Failed to fetch students:', err)
        setError('Failed to load students')
        toast.error('Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = filterSubject === 'all' || student.primarySubject === filterSubject
      return matchesSearch && matchesSubject
    })
    .sort((a, b) => {
      if (sortBy === 'mastery') {
        return (b.masteryPercentage || 0) - (a.masteryPercentage || 0)
      }
      return a.name.localeCompare(b.name)
    })

  if (loading) return <LoadingSpinner message="Loading students..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
        <p className="text-gray-600">Track progress and support learning for all your assigned students</p>
      </div>

      {/* Filters and Search */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="input-field"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
            <option value="mastery">Sort by Mastery</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="card-hover border-2 border-gray-200 cursor-pointer"
              onClick={() => navigate(`/mentor/student/${student.id}/progress`)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
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

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-primary-50 rounded-lg p-3">
                  <p className="text-xs text-primary-600 mb-1">Mastery</p>
                  <p className="text-2xl font-bold text-primary-700">{student.masteryPercentage || 0}%</p>
                </div>
                <div className="bg-accent-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="w-4 h-4 text-accent-600" />
                    <p className="text-xs text-accent-600">Streak</p>
                  </div>
                  <p className="text-2xl font-bold text-accent-700">{student.streak || 0}</p>
                </div>
              </div>

              {/* Subject and Primary Focus */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Subject</p>
                <p className="font-medium text-gray-900">{student.primarySubject || 'N/A'}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle schedule meet
                    toast.success('Opening schedule dialog...')
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  Schedule
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle add notes
                    toast.success('Opening notes dialog...')
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  Notes
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            {searchTerm || filterSubject !== 'all' ? 'No students match your filters' : 'No students assigned yet'}
          </p>
          {!searchTerm && filterSubject === 'all' && (
            <a href="/mentor/browse-ngos" className="btn-primary">
              Join an NGO to Get Started
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default MyStudents
