import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Search, MapPin, BookOpen, Users, MapPinIcon, ChevronDown, ChevronUp } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const BrowseNGOs = () => {
  const [ngos, setNgos] = useState([])
  const [filteredNgos, setFilteredNgos] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNgo, setSelectedNgo] = useState(null)
  const [filters, setFilters] = useState({
    region: '',
    subjects: [],
    grades: [],
  })
  const [showFilters, setShowFilters] = useState(false)

  const regions = ['North', 'South', 'East', 'West', 'Central']
  const subjects = ['Math', 'EVS', 'Telugu', 'English', 'Hindi']
  const grades = ['Class 1-2', 'Class 3-4', 'Class 5-6', 'Class 7-8']

  useEffect(() => {
    fetchNgos()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, filters, ngos])

  const fetchNgos = async () => {
    try {
      setLoading(true)
      const response = await api.volunteer.browseNGOs()
      const ngoList = response.data.data || response.data || []
      setNgos(ngoList)
      setFilteredNgos(ngoList)
    } catch (error) {
      console.error('Failed to fetch NGOs:', error)
      toast.error('Failed to load NGOs')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = ngos

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (ngo) =>
          ngo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ngo.mission?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Region filter
    if (filters.region) {
      filtered = filtered.filter((ngo) => ngo.region === filters.region)
    }

    // Subjects filter
    if (filters.subjects.length > 0) {
      filtered = filtered.filter((ngo) =>
        filters.subjects.some((subject) =>
          ngo.subjects?.includes(subject)
        )
      )
    }

    // Grades filter
    if (filters.grades.length > 0) {
      filtered = filtered.filter((ngo) =>
        filters.grades.some((grade) =>
          ngo.grades?.includes(grade)
        )
      )
    }

    setFilteredNgos(filtered)
  }

  const handleRequestToJoin = async (ngoId) => {
    try {
      setRequesting((prev) => ({ ...prev, [ngoId]: true }))
      await api.volunteer.joinNGO(ngoId)
      toast.success('Request sent to NGO!')
      setNgos(
        ngos.map((ngo) =>
          ngo._id === ngoId ? { ...ngo, requestStatus: 'pending' } : ngo
        )
      )
    } catch (error) {
      console.error('Failed to send request:', error)
      toast.error('Failed to send join request')
    } finally {
      setRequesting((prev) => ({ ...prev, [ngoId]: false }))
    }
  }

  const handleToggleSubject = (subject) => {
    setFilters((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleToggleGrade = (grade) => {
    setFilters((prev) => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade],
    }))
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse NGOs</h1>
        <p className="text-gray-600 mt-1">Find and join NGOs to start teaching</p>
      </div>

      {/* Search Bar */}
      <div className="card sticky top-20 z-20">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search NGOs by name or mission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, region: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Subjects Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Subjects
              </label>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <label key={subject} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.subjects.includes(subject)}
                      onChange={() => handleToggleSubject(subject)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grades Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Grade Bands
              </label>
              <div className="space-y-2">
                {grades.map((grade) => (
                  <label key={grade} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.grades.includes(grade)}
                      onChange={() => handleToggleGrade(grade)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">{grade}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredNgos.length} of {ngos.length} NGOs
      </div>

      {/* NGO Cards Grid */}
      {filteredNgos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNgos.map((ngo) => (
            <div key={ngo._id || ngo.id} className="card hover:shadow-lg transition-shadow">
              {/* Header with Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{ngo.name}</h3>
                </div>
                {ngo.requestStatus && (
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      ngo.requestStatus === 'joined'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {ngo.requestStatus === 'joined' ? 'Joined' : 'Requested'}
                  </span>
                )}
              </div>

              {/* Mission */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {ngo.mission ||
                  'Helping underserved communities through education'}
              </p>

              {/* Location and Stats */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{ngo.region || 'Unknown Region'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{ngo.studentCount || 0} students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{ngo.volunteerCount || 0} volunteers</span>
                </div>
              </div>

              {/* Subjects */}
              {ngo.subjects && ngo.subjects.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {ngo.subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                    {ngo.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        +{ngo.subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Grades */}
              {ngo.grades && ngo.grades.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Grades:</p>
                  <div className="flex flex-wrap gap-1">
                    {ngo.grades.map((grade) => (
                      <span
                        key={grade}
                        className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                      >
                        {grade}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedNgo(ngo)}
                  className="btn btn-outline flex-1"
                >
                  Learn More
                </button>
                {!ngo.requestStatus && (
                  <button
                    onClick={() => handleRequestToJoin(ngo._id || ngo.id)}
                    disabled={requesting[ngo._id || ngo.id]}
                    className="btn btn-primary flex-1"
                  >
                    {requesting[ngo._id || ngo.id] ? 'Requesting...' : 'Join'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No NGOs found matching your criteria</p>
        </div>
      )}

      {/* NGO Detail Modal */}
      {selectedNgo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedNgo.name}</h2>
              <button
                onClick={() => setSelectedNgo(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
                <p className="text-gray-700">{selectedNgo.mission}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="font-medium text-gray-900">{selectedNgo.region}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="font-medium text-gray-900">{selectedNgo.studentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Volunteers</p>
                  <p className="font-medium text-gray-900">{selectedNgo.volunteerCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Founded</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedNgo.createdAt || selectedNgo.date).getFullYear()}
                  </p>
                </div>
              </div>

              {selectedNgo.subjects && selectedNgo.subjects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNgo.subjects.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNgo.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">About</p>
                  <p className="text-gray-700">{selectedNgo.description}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                {!selectedNgo.requestStatus ? (
                  <button
                    onClick={() => {
                      handleRequestToJoin(selectedNgo._id || selectedNgo.id)
                      setSelectedNgo(null)
                    }}
                    className="btn btn-primary flex-1"
                  >
                    Request to Join
                  </button>
                ) : (
                  <button className="btn btn-outline flex-1" disabled>
                    {selectedNgo.requestStatus === 'joined' ? 'Already Joined' : 'Request Pending'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedNgo(null)}
                  className="btn btn-outline flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrowseNGOs
