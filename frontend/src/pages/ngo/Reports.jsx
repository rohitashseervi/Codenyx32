import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Download, BarChart3, Users, TrendingUp, Target, Award } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Reports = () => {
  const { profile } = useAuth()
  const ngoId = profile?.ngoId
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [reportData, setReportData] = useState(null)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    if (!ngoId) return

    const fetchReportData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock report data
        setReportData({
          reach: {
            totalStudents: 245,
            schoolsPartnered: 12,
            regionsServed: 5,
            volunteersActive: 18,
            mentorsActive: 8,
          },
          outcomes: {
            avgMasteryImprovement: 24,
            studentsGradeImproved: 67,
            gradeImprovalPercentage: 27,
            atRiskReduction: 18,
            completionRate: 92,
          },
          effectiveness: {
            volunteerSessionCompletion: 88,
            mentorStudentMatching: 95,
            volunteerRetentionRate: 82,
          },
          atRiskResolution: {
            identified: 42,
            resolved: 28,
            resolutionRate: 67,
          },
          topPerformers: [
            { name: 'Rajesh Kumar (Volunteer)', metric: 'Sessions', value: 45 },
            { name: 'Priya Sharma (Mentor)', metric: 'Student Improvement', value: '+32%' },
            { name: 'Maya Patel (Student)', metric: 'Mastery Score', value: '94%' },
          ],
        })
      } catch (err) {
        console.error('Failed to fetch report data:', err)
        setError('Failed to load report data. Please try again.')
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [ngoId, dateRange])

  const handleExport = async (format) => {
    try {
      setExporting(format)
      toast.success(`Exporting as ${format.toUpperCase()}...`)
      // In a real app, this would call an API to generate and download the file
      setTimeout(() => {
        toast.success(`${format.toUpperCase()} exported successfully!`)
        setExporting(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to export:', err)
      toast.error('Failed to export report')
      setExporting(null)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Impact Reports</h1>
          <p className="text-gray-600 mt-2">View and export comprehensive NGO impact reports</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Date Range & Export */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting === 'pdf' ? 'Exporting...' : 'Download PDF'}</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting === 'excel'}
                className="flex items-center gap-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting === 'excel' ? 'Exporting...' : 'Download Excel'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Sections */}
        {reportData && (
          <>
            {/* Reach Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary-600" />
                Reach Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <ReportCard
                  icon={Users}
                  label="Total Students"
                  value={reportData.reach.totalStudents}
                  color="primary"
                />
                <ReportCard
                  icon={Target}
                  label="Schools Partnered"
                  value={reportData.reach.schoolsPartnered}
                  color="secondary"
                />
                <ReportCard
                  icon={BarChart3}
                  label="Regions Served"
                  value={reportData.reach.regionsServed}
                  color="accent"
                />
                <ReportCard
                  icon={Users}
                  label="Active Volunteers"
                  value={reportData.reach.volunteersActive}
                  color="success"
                />
                <ReportCard
                  icon={Award}
                  label="Active Mentors"
                  value={reportData.reach.mentorsActive}
                  color="danger"
                />
              </div>
            </div>

            {/* Outcome Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-600" />
                Outcome Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-6">Mastery & Grade Improvement</h3>

                  <div className="space-y-6">
                    <MetricRow
                      label="Avg Mastery Improvement"
                      value={reportData.outcomes.avgMasteryImprovement}
                      unit="%"
                      color="primary"
                    />
                    <MetricRow
                      label="Students with Grade Improvement"
                      value={reportData.outcomes.studentsGradeImproved}
                      total={reportData.reach.totalStudents}
                      percentage={reportData.outcomes.gradeImprovalPercentage}
                      color="success"
                    />
                    <MetricRow
                      label="At-Risk Students Resolved"
                      value={reportData.atRiskResolution.resolved}
                      total={reportData.atRiskResolution.identified}
                      percentage={reportData.atRiskResolution.resolutionRate}
                      color="accent"
                    />
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-6">Performance Indicators</h3>

                  <div className="space-y-6">
                    <PerformanceIndicator
                      label="Session Completion Rate"
                      value={reportData.outcomes.completionRate}
                      targetValue={90}
                    />
                    <PerformanceIndicator
                      label="Volunteer Session Completion"
                      value={reportData.effectiveness.volunteerSessionCompletion}
                      targetValue={85}
                    />
                    <PerformanceIndicator
                      label="Mentor-Student Matching Effectiveness"
                      value={reportData.effectiveness.mentorStudentMatching}
                      targetValue={90}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Volunteer & Mentor Effectiveness */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer & Mentor Effectiveness</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EffectivenesCard
                  title="Volunteer Retention Rate"
                  value={reportData.effectiveness.volunteerRetentionRate}
                  description="Percentage of volunteers continuing after 3 months"
                />
                <EffectivenesCard
                  title="Mentor-Student Matching Success"
                  value={reportData.effectiveness.mentorStudentMatching}
                  description="Successful matches based on expertise & needs"
                />
                <EffectivenesCard
                  title="Session Completion Rate"
                  value={reportData.effectiveness.volunteerSessionCompletion}
                  description="Sessions completed vs scheduled"
                />
              </div>
            </div>

            {/* At-Risk Student Resolution */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">At-Risk Student Resolution</h2>

              <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Identified</p>
                    <p className="text-4xl font-bold text-gray-900">{reportData.atRiskResolution.identified}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Resolved</p>
                    <p className="text-4xl font-bold text-green-600">{reportData.atRiskResolution.resolved}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 text-sm mb-2">Resolution Rate</p>
                    <p className="text-4xl font-bold text-primary-600">{reportData.atRiskResolution.resolutionRate}%</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{ width: `${reportData.atRiskResolution.resolutionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-fit">
                      {reportData.atRiskResolution.resolutionRate}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Performers</h2>

              <div className="card">
                <div className="space-y-4">
                  {reportData.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.metric}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{performer.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Report Card Component
const ReportCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
    danger: 'bg-danger-50 text-danger-600',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

// Metric Row Component
const MetricRow = ({ label, value, total, percentage, unit = '', color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 border-primary-300',
    secondary: 'bg-secondary-100 border-secondary-300',
    accent: 'bg-accent-100 border-accent-300',
    success: 'bg-success-100 border-success-300',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-900 font-medium">{label}</span>
        <span className="text-lg font-bold text-gray-900">
          {value}
          {unit && <span className="text-gray-600 ml-1">{unit}</span>}
          {percentage && <span className="text-gray-600 ml-1">({percentage}%)</span>}
        </span>
      </div>
      {total && (
        <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
          <div
            className={`h-3 rounded-full border ${colorClasses[color]}`}
            style={{ width: `${(value / total) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

// Performance Indicator Component
const PerformanceIndicator = ({ label, value, targetValue }) => {
  const isAboveTarget = value >= targetValue
  const gap = targetValue - value

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-900 font-medium">{label}</span>
        <div className="text-right">
          <span className={`text-lg font-bold ${isAboveTarget ? 'text-green-600' : 'text-yellow-600'}`}>
            {value}%
          </span>
          <span className="text-xs text-gray-600 ml-2">Target: {targetValue}%</span>
        </div>
      </div>

      <div className="flex gap-1">
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div
            className={isAboveTarget ? 'bg-green-600' : 'bg-yellow-600'}
            style={{ width: `${Math.min(value, 100)}%`, height: '100%', borderRadius: '9999px' }}
          ></div>
        </div>
      </div>

      {!isAboveTarget && (
        <p className="text-xs text-yellow-600 mt-1">{gap}% below target</p>
      )}
    </div>
  )
}

// Effectiveness Card Component
const EffectivenesCard = ({ title, value, description }) => {
  return (
    <div className="card text-center">
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-4xl font-bold text-primary-600 mb-3">{value}%</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export default Reports
