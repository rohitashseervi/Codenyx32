import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const Mentors = () => {
  const { profile } = useAuth()
  const ngoId = profile?.ngoId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [mentors, setMentors] = useState({
    pending: [],
    active: [],
    inactive: [],
  })
  const [approving, setApproving] = useState(null)

  useEffect(() => {
    if (!ngoId) return

    const fetchMentors = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock data - replace with actual API calls
        const pendingResponse = await api.ngo.getMentors(ngoId, { status: 'pending' })
        const activeResponse = await api.ngo.getMentors(ngoId, { status: 'active' })
        const inactiveResponse = await api.ngo.getMentors(ngoId, { status: 'inactive' })

        setMentors({
          pending: [
            {
              id: 'm1',
              name: 'Dr. Vikram Sharma',
              expertSubjects: ['Mathematics', 'Physics'],
              qualifications: 'M.Sc Physics, 5 years teaching',
              availability: 'Weekends',
              experience: '5 years',
              email: 'vikram@example.com',
              behavioralSummary: {
                mentoring: 'Good',
                communication: 'Excellent',
                punctuality: 'Reliable',
              },
            },
            {
              id: 'm2',
              name: 'Ms. Anjali Gupta',
              expertSubjects: ['English', 'Hindi'],
              qualifications: 'MA English, 3 years experience',
              availability: 'Evenings',
              experience: '3 years',
              email: 'anjali@example.com',
              behavioralSummary: {
                mentoring: 'Excellent',
                communication: 'Excellent',
                punctuality: 'Good',
              },
            },
          ],
          active: [
            {
              id: 'm3',
              name: 'Prof. Rajesh Kumar',
              expertSubjects: ['Science', 'Mathematics'],
              studentsCurrently: 5,
              studentsMax: 8,
              avgStudentImprovement: 18,
              joinedDate: '2024-01-10',
            },
            {
              id: 'm4',
              name: 'Ms. Neha Singh',
              expertSubjects: ['Social Studies', 'History'],
              studentsCurrently: 4,
              studentsMax: 6,
              avgStudentImprovement: 22,
              joinedDate: '2024-01-20',
            },
          ],
          inactive: [
            {
              id: 'm5',
              name: 'Mr. Arun Verma',
              expertSubjects: ['Mathematics'],
              lastActive: '2024-02-20',
            },
          ],
        })
      } catch (err) {
        console.error('Failed to fetch mentors:', err)
        setError('Failed to load mentors. Please try again.')
        toast.error('Failed to load mentors')
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [ngoId])

  const handleApprove = async (mentorId) => {
    try {
      setApproving(mentorId)
      await api.ngo.approve(ngoId, mentorId)
      toast.success('Mentor approved!')

      setMentors((prev) => ({
        ...prev,
        pending: prev.pending.filter((m) => m.id !== mentorId),
        active: [
          ...prev.active,
          {
            ...prev.pending.find((m) => m.id === mentorId),
            studentsCurrently: 0,
            studentsMax: 10,
            avgStudentImprovement: 0,
            joinedDate: new Date().toISOString().split('T')[0],
          },
        ],
      }))
    } catch (err) {
      console.error('Failed to approve mentor:', err)
      toast.error('Failed to approve mentor')
    } finally {
      setApproving(null)
    }
  }

  const handleReject = async (mentorId) => {
    try {
      setApproving(mentorId)
      await api.ngo.reject(ngoId, mentorId)
      toast.success('Mentor rejected')

      setMentors((prev) => ({
        ...prev,
        pending: prev.pending.filter((m) => m.id !== mentorId),
      }))
    } catch (err) {
      console.error('Failed to reject mentor:', err)
      toast.error('Failed to reject mentor')
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading mentors..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
          <p className="text-gray-600 mt-2">Manage and approve mentors for your NGO</p>
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
              <span>Pending Approval ({mentors.pending.length})</span>
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
              <span>Active ({mentors.active.length})</span>
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
              <span>Inactive ({mentors.inactive.length})</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {mentors.pending && mentors.pending.length > 0 ? (
              mentors.pending.map((mentor) => (
                <div key={mentor.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                      <p className="text-gray-600 mt-1">{mentor.email}</p>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Expert Subjects</p>
                          <div className="flex flex-wrap gap-2">
                            {mentor.expertSubjects.map((subject, idx) => (
                              <span key={idx} className="px-3 py-1 bg-accent-100 text-accent-800 text-sm rounded-full font-medium">
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Qualifications</p>
                          <p className="font-medium text-gray-900">{mentor.qualifications}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Availability</p>
                          <p className="font-medium text-gray-900">{mentor.availability}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Behavioral Assessment</p>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(mentor.behavioralSummary).map(([key, value]) => (
                            <div key={key} className="p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 capitalize">{key}</p>
                              <p className="text-sm font-semibold text-gray-900">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex gap-3">
                      <button
                        onClick={() => handleApprove(mentor.id)}
                        disabled={approving === mentor.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {approving === mentor.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(mentor.id)}
                        disabled={approving === mentor.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {approving === mentor.id ? 'Rejecting...' : 'Reject'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expert Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Avg Improvement</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mentors.active && mentors.active.length > 0 ? (
                  mentors.active.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mentor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertSubjects.map((subject, idx) => (
                            <span key={idx} className="px-2 py-1 bg-accent-100 text-accent-800 text-xs rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">
                          {mentor.studentsCurrently}/{mentor.studentsMax}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">+{mentor.avgStudentImprovement}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mentor.joinedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/ngo_admin/mentors/${mentor.id}`}
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
                      No active mentors
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expert Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mentors.inactive && mentors.inactive.length > 0 ? (
                  mentors.inactive.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mentor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertSubjects.map((subject, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{mentor.lastActive}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No inactive mentors
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

export default Mentors
