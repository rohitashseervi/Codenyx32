import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const Volunteers = () => {
  const { profile } = useAuth()
  const ngoId = profile?.ngoId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [volunteers, setVolunteers] = useState({
    pending: [],
    active: [],
    inactive: [],
  })
  const [approving, setApproving] = useState(null)

  useEffect(() => {
    if (!ngoId) return

    const fetchVolunteers = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock data - replace with actual API calls
        const pendingResponse = await api.ngo.getVolunteers(ngoId, { status: 'pending' })
        const activeResponse = await api.ngo.getVolunteers(ngoId, { status: 'active' })
        const inactiveResponse = await api.ngo.getVolunteers(ngoId, { status: 'inactive' })

        setVolunteers({
          pending: [
            {
              id: 'v1',
              name: 'Amit Singh',
              subjects: ['Mathematics', 'English'],
              gradeBand: '1-3',
              timeSlots: ['Mon-Wed: 6-7 PM', 'Sat: 10-11 AM'],
              experience: '2 years',
              email: 'amit@example.com',
            },
            {
              id: 'v2',
              name: 'Priya Patel',
              subjects: ['Science'],
              gradeBand: '3-5',
              timeSlots: ['Tue-Thu: 5-6 PM'],
              experience: '1 year',
              email: 'priya@example.com',
            },
          ],
          active: [
            {
              id: 'v3',
              name: 'Rajesh Kumar',
              subjects: ['Mathematics', 'Science'],
              studentsAssigned: 8,
              sessionCompletionRate: 92,
              joinedDate: '2024-01-15',
            },
            {
              id: 'v4',
              name: 'Sneha Sharma',
              subjects: ['English', 'Social Studies'],
              studentsAssigned: 6,
              sessionCompletionRate: 88,
              joinedDate: '2024-02-01',
            },
          ],
          inactive: [
            {
              id: 'v5',
              name: 'Arjun Verma',
              subjects: ['Mathematics'],
              lastActive: '2024-02-15',
            },
          ],
        })
      } catch (err) {
        console.error('Failed to fetch volunteers:', err)
        setError('Failed to load volunteers. Please try again.')
        toast.error('Failed to load volunteers')
      } finally {
        setLoading(false)
      }
    }

    fetchVolunteers()
  }, [ngoId])

  const handleApprove = async (volunteerId) => {
    try {
      setApproving(volunteerId)
      await api.ngo.approve(ngoId, volunteerId)
      toast.success('Volunteer approved!')

      // Move from pending to active
      setVolunteers((prev) => ({
        ...prev,
        pending: prev.pending.filter((v) => v.id !== volunteerId),
        active: [...prev.active, prev.pending.find((v) => v.id === volunteerId)],
      }))
    } catch (err) {
      console.error('Failed to approve volunteer:', err)
      toast.error('Failed to approve volunteer')
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (volunteerId) => {
    try {
      setApproving(volunteerId)
      await api.ngo.reject(ngoId, volunteerId)
      toast.success('Volunteer rejected')

      setVolunteers((prev) => ({
        ...prev,
        pending: prev.pending.filter((v) => v.id !== volunteerId),
      }))
    } catch (err) {
      console.error('Failed to reject volunteer:', err)
      toast.error('Failed to reject volunteer')
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading volunteers..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-gray-600 mt-2">Manage and approve volunteers for your NGO</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Pending Approval ({volunteers.pending.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Active ({volunteers.active.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'inactive'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>Inactive ({volunteers.inactive.length})</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {volunteers.pending && volunteers.pending.length > 0 ? (
              volunteers.pending.map((volunteer) => (
                <div key={volunteer.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{volunteer.name}</h3>
                      <p className="text-gray-600 mt-1">{volunteer.email}</p>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Subjects</p>
                          <div className="flex flex-wrap gap-2">
                            {volunteer.subjects.map((subject, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Grade Band</p>
                          <p className="font-medium text-gray-900">Grade {volunteer.gradeBand}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Experience</p>
                          <p className="font-medium text-gray-900">{volunteer.experience}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Available Time Slots</p>
                        <div className="flex flex-wrap gap-2">
                          {volunteer.timeSlots.map((slot, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex gap-3">
                      <button
                        onClick={() => handleApprove(volunteer.id)}
                        disabled={approving === volunteer.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {approving === volunteer.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(volunteer.id)}
                        disabled={approving === volunteer.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {approving === volunteer.id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending approvals</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="overflow-x-auto card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {volunteers.active && volunteers.active.length > 0 ? (
                  volunteers.active.map((volunteer) => (
                    <tr key={volunteer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{volunteer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {volunteer.subjects.map((subject, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Users className="w-4 h-4" />
                          <span>{volunteer.studentsAssigned}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${volunteer.sessionCompletionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{volunteer.sessionCompletionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{volunteer.joinedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/ngo_admin/volunteers/${volunteer.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No active volunteers
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inactive' && (
          <div className="overflow-x-auto card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {volunteers.inactive && volunteers.inactive.length > 0 ? (
                  volunteers.inactive.map((volunteer) => (
                    <tr key={volunteer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{volunteer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {volunteer.subjects.map((subject, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{volunteer.lastActive}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No inactive volunteers
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Volunteers
