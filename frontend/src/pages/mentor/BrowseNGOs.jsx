import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Search, MapPin, Users, Trophy } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const BrowseNGOs = () => {
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('all')
  const [joinedNgos, setJoinedNgos] = useState(new Set())
  const [pendingRequests, setPendingRequests] = useState(new Set())

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        setLoading(true)
        const response = await api.mentor.browseNGOs()
        setNgos(response.data.ngos || [])
        // Track already joined NGOs
        const joined = new Set(
          response.data.ngos?.filter((ngo) => ngo.status === 'joined').map((ngo) => ngo.id) || []
        )
        setJoinedNgos(joined)
      } catch (err) {
        console.error('Failed to fetch NGOs:', err)
        setError('Failed to load NGOs')
        toast.error('Failed to load NGOs')
      } finally {
        setLoading(false)
      }
    }

    fetchNGOs()
  }, [])

  const handleJoinNGO = async (ngoId) => {
    try {
      setPendingRequests((prev) => new Set([...prev, ngoId]))
      await api.mentor.joinNGO(ngoId)
      setJoinedNgos((prev) => new Set([...prev, ngoId]))
      toast.success('Join request sent successfully!')
    } catch (err) {
      console.error('Failed to join NGO:', err)
      toast.error('Failed to send join request')
    } finally {
      setPendingRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(ngoId)
        return newSet
      })
    }
  }

  const filteredNgos = ngos.filter((ngo) => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = filterCity === 'all' || ngo.city === filterCity
    return matchesSearch && matchesCity
  })

  const cities = ['all', ...new Set(ngos.map((ngo) => ngo.city).filter(Boolean))]

  if (loading) return <LoadingSpinner message="Loading NGOs..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse NGOs</h1>
        <p className="text-gray-600">Find and join organizations to start mentoring students</p>
      </div>

      {error && (
        <div className="card bg-danger-50 border-2 border-danger-200">
          <p className="text-danger-700">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search NGOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* City Filter */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="input-field"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All Cities' : city}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredNgos.length} of {ngos.length} NGOs
        </p>
      </div>

      {/* NGOs Grid */}
      {filteredNgos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNgos.map((ngo) => (
            <div key={ngo.id} className="card-hover border-2 border-gray-200">
              {/* NGO Header */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{ngo.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {ngo.city || 'Location TBD'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{ngo.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="bg-primary-50 rounded-lg p-3">
                  <p className="text-xs text-primary-600 mb-1">Students</p>
                  <p className="text-xl font-bold text-primary-700">{ngo.studentCount || 0}</p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-3">
                  <p className="text-xs text-secondary-600 mb-1">Mentors</p>
                  <p className="text-xl font-bold text-secondary-700">{ngo.mentorCount || 0}</p>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {ngo.focusAreas?.slice(0, 3).map((area) => (
                    <span key={area} className="badge-info text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleJoinNGO(ngo.id)}
                disabled={joinedNgos.has(ngo.id) || pendingRequests.has(ngo.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                  joinedNgos.has(ngo.id)
                    ? 'bg-success-100 text-success-700 cursor-default'
                    : pendingRequests.has(ngo.id)
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {joinedNgos.has(ngo.id)
                  ? '✓ Joined'
                  : pendingRequests.has(ngo.id)
                    ? 'Sending...'
                    : 'Request to Join'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCity !== 'all' ? 'No NGOs match your search' : 'No NGOs available'}
          </p>
        </div>
      )}
    </div>
  )
}

export default BrowseNGOs
