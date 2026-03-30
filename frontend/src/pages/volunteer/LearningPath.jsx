import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { CheckCircle, Clock, Lock, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const LearningPath = () => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLearningPath()
  }, [])

  const fetchLearningPath = async () => {
    try {
      setLoading(true)
      const response = await api.volunteer.getLearningPath()
      const pathData = response.data.learningPath
      
      if (pathData && pathData.modules) {
        // Map backend module structure to frontend expectations
        const formattedModules = pathData.modules.map(m => ({
          ...m,
          topic: m.moduleName,
          duration: m.moduleDuration
        }))
        setModules(formattedModules)
      } else {
        setModules([])
      }
    } catch (error) {
      console.error('Failed to fetch learning path:', error)
      toast.error('Failed to load learning path')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const completedModules = modules.filter((m) => m.status === 'completed').length
  const totalModules = modules.length
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 border-green-300',
      upcoming: 'bg-gray-100 border-gray-300',
      'in-progress': 'bg-blue-100 border-blue-300',
      skipped: 'bg-red-100 border-red-300',
    }
    return colors[status] || colors.upcoming
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'upcoming':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
      case 'skipped':
        return <Lock className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
        <p className="text-gray-600 mt-1">Track your teaching progression</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Overall Progress</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-3">{progressPercent}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {completedModules} of {totalModules} modules completed
          </p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600 mb-3">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completedModules}</p>
          <p className="text-xs text-gray-600 mt-2">modules completed</p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600 mb-3">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">
            {modules.filter((m) => m.status === 'in-progress').length}
          </p>
          <p className="text-xs text-gray-600 mt-2">current modules</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Module Timeline</h2>

        {modules.length > 0 ? (
          <div className="space-y-6">
            {modules.map((module, index) => {
              const isCurrentModule = module.status === 'in-progress'
              const scheduledDate = new Date(module.scheduledDate || module.date)

              return (
                <div key={module._id || index} className="relative">
                  {/* Timeline connector */}
                  {index !== modules.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200"></div>
                  )}

                  {/* Module item */}
                  <div
                    className={`relative flex gap-6 p-5 rounded-lg border-2 transition-all ${
                      getStatusColor(module.status)
                    } ${isCurrentModule ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-current">
                      {getStatusIcon(module.status)}
                    </div>

                    {/* Module Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.topic || `Module ${index + 1}`}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Scheduled for {scheduledDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                            module.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : module.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : module.status === 'upcoming'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {module.status}
                        </span>
                      </div>

                      {module.description && (
                        <p className="text-sm text-gray-700 mb-3">{module.description}</p>
                      )}

                      {/* Score Display for Completed Modules */}
                      {module.status === 'completed' && module.score !== undefined && (
                        <div className="mt-3 p-3 bg-white rounded border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Test Score</span>
                            <span className="text-lg font-bold text-green-600">{module.score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${module.score}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Module Metadata */}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
                        {module.duration && (
                          <span>Duration: {module.duration} hours</span>
                        )}
                        {module.studentCount !== undefined && (
                          <span>Students: {module.studentCount}</span>
                        )}
                        {module.testId && (
                          <a
                            href={`/volunteer/test-results?testId=${module.testId}`}
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            View Test Results
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No learning path available yet</p>
          </div>
        )}
      </div>

      {/* Path Stats */}
      {modules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Timeline</h3>
            <div className="space-y-3">
              {modules
                .filter((m) => m.status === 'completed')
                .map((m) => (
                  <div key={m._id || m.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{m.topic || 'Module'}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(m.completedDate || m.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Focus</h3>
            {modules.find((m) => m.status === 'in-progress' || m.status === 'upcoming') && (
              <div className="space-y-3">
                {modules
                  .filter((m) => m.status === 'in-progress' || m.status === 'upcoming')
                  .slice(0, 3)
                  .map((m) => (
                    <div key={m._id || m.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-sm text-gray-900">{m.topic || 'Module'}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(m.scheduledDate || m.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningPath
