import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { AlertCircle, Filter } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterReviewed, setFilterReviewed] = useState('unreviewed')
  const [reviewedAlerts, setReviewedAlerts] = useState(new Set())

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const response = await api.mentor.getAlerts()
        setAlerts(response.data?.alerts || response.data?.data || [])
      } catch (err) {
        console.error('Failed to fetch alerts:', err)
        setError('Failed to load alerts')
        toast.error('Failed to load alerts')
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const getScoreColor = (score) => {
    if (score < 30) return 'bg-danger-50 border-danger-200'
    if (score < 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-primary-50 border-primary-200'
  }

  const getScoreBadge = (score) => {
    if (score < 30) return 'badge-danger'
    if (score < 50) return 'badge-warning'
    return 'badge-success'
  }

  const getScoreIcon = (score) => {
    if (score < 30) return '❌'
    if (score < 50) return '⚠️'
    return '✅'
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filterReviewed === 'unreviewed') return !reviewedAlerts.has(alert.id)
    if (filterReviewed === 'reviewed') return reviewedAlerts.has(alert.id)
    return true
  })

  const markReviewed = (alertId) => {
    const newReviewed = new Set(reviewedAlerts)
    newReviewed.add(alertId)
    setReviewedAlerts(newReviewed)
    toast.success('Alert marked as reviewed')
  }

  if (loading) return <LoadingSpinner message="Loading alerts..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Alerts</h1>
        <p className="text-gray-600">Students who need extra support and attention</p>
      </div>

      {/* Filter Bar */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Show:</span>
        </div>
        <div className="flex gap-2">
          {['all', 'unreviewed', 'reviewed'].map((option) => (
            <button
              key={option}
              onClick={() => setFilterReviewed(option)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterReviewed === option
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card border-2 ${getScoreColor(alert.score)} space-y-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{getScoreIcon(alert.score)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{alert.studentName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Test:</strong> {alert.topic}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {new Date(alert.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-gray-900">{alert.score}%</p>
                  <span className={getScoreBadge(alert.score)}>
                    {alert.score < 30 ? 'Critical' : alert.score < 50 ? 'Warning' : 'Good'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    toast.success('Opening schedule dialog...')
                  }}
                  className="flex-1 btn-primary text-sm"
                >
                  Schedule Meet
                </button>
                <button
                  onClick={() => {
                    toast.success('Opening details...')
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  View Details
                </button>
                {!reviewedAlerts.has(alert.id) && (
                  <button
                    onClick={() => markReviewed(alert.id)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    Mark Reviewed
                  </button>
                )}
                {reviewedAlerts.has(alert.id) && (
                  <span className="flex items-center justify-center px-4 py-2 rounded-lg bg-success-100 text-success-700 text-sm font-medium">
                    ✓ Reviewed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filterReviewed === 'reviewed' ? 'No Reviewed Alerts' : 'All Clear!'}
          </h3>
          <p className="text-gray-600">
            {filterReviewed === 'reviewed'
              ? 'You have reviewed all alerts'
              : 'No students currently need attention'}
          </p>
        </div>
      )}

      {/* Summary */}
      {alerts.length > 0 && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Alert Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Critical (Below 30%)</p>
              <p className="text-2xl font-bold text-danger-600">
                {alerts.filter((a) => a.score < 30).length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-success-600">{reviewedAlerts.size}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Alerts
