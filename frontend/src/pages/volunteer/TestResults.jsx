import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { BarChart3, Download, TrendingDown, Award, Target } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TestResults = () => {
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  useEffect(() => {
    if (selectedTest) {
      fetchTestResults(selectedTest)
    }
  }, [selectedTest])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await api.volunteer.getTestResults({ limit: 20 })
      const raw = response.data?.data || response.data?.tests || []
      const testList = Array.isArray(raw) ? raw : []
      setTests(testList)

      if (testList.length > 0) {
        setSelectedTest(testList[0]._id || testList[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error)
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const fetchTestResults = async (testId) => {
    try {
      setLoadingResults(true)
      const response = await api.test.getScorecard(testId)
      setResults(response.data.data || response.data)
    } catch (error) {
      console.error('Failed to fetch test results:', error)
      toast.error('Failed to load test results')
    } finally {
      setLoadingResults(false)
    }
  }

  const handleExportResults = () => {
    if (!results) return

    const csvContent = [
      ['Student Name', 'Score', 'Time Taken (mins)', 'Mastery Level', 'Status'],
      ...results.studentScores.map((s) => [
        s.studentName,
        s.score,
        s.timeTaken || '-',
        s.masteryLevel || '-',
        s.status || 'completed',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-results-${selectedTest}-${new Date().getTime()}.csv`
    a.click()

    toast.success('Results exported!')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const getMasteryColor = (level) => {
    const colors = {
      expert: 'text-green-600 bg-green-50',
      proficient: 'text-blue-600 bg-blue-50',
      developing: 'text-yellow-600 bg-yellow-50',
      beginning: 'text-red-600 bg-red-50',
    }
    return colors[level?.toLowerCase()] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
        <p className="text-gray-600 mt-1">Review student performance and assessments</p>
      </div>

      {/* Test Selection */}
      <div className="card">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Select Assessment
        </label>
        <select
          value={selectedTest || ''}
          onChange={(e) => setSelectedTest(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a test...</option>
          {tests.map((test) => (
            <option key={test._id || test.id} value={test._id || test.id}>
              {test.topic || test.title} - {new Date(test.createdAt || test.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Results */}
      {loadingResults && <LoadingSpinner />}

      {/* Results Overview */}
      {results && selectedTest && !loadingResults && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {results.averageScore ? Math.round(results.averageScore) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Highest Score</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {results.highestScore || 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Lowest Score</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {results.lowestScore || 0}%
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Students Tested</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {results.studentScores?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Class Scorecard */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Class Scorecard</h2>
              <button
                onClick={handleExportResults}
                className="btn btn-outline flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Student Name
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Score
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Time Taken (mins)
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Mastery Level
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.studentScores && results.studentScores.length > 0 ? (
                    results.studentScores.map((student, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {student.studentName || `Student ${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block font-bold px-3 py-1 rounded-full ${
                              student.score >= 80
                                ? 'bg-green-100 text-green-800'
                                : student.score >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {student.score}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {student.timeTaken || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMasteryColor(student.masteryLevel)}`}
                          >
                            {student.masteryLevel || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              student.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : student.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {student.status || 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-600">
                        No student results available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question-wise Analysis */}
          {results.questionAnalysis && results.questionAnalysis.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Question-wise Analysis
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Questions where most students struggled
              </p>

              <div className="space-y-3">
                {results.questionAnalysis
                  .sort((a, b) => a.correctPercentage - b.correctPercentage)
                  .slice(0, 5)
                  .map((q, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            Question {q.questionNumber}: {q.question}
                          </p>
                          <p className="text-sm text-gray-600">
                            {q.correctPercentage}% of students answered correctly
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                            q.correctPercentage >= 80
                              ? 'bg-green-100 text-green-800'
                              : q.correctPercentage >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {q.correctPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            q.correctPercentage >= 80
                              ? 'bg-green-600'
                              : q.correctPercentage >= 60
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                          }`}
                          style={{ width: `${q.correctPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>

              {results.questionAnalysis.length === 0 && (
                <p className="text-gray-600 text-center py-6">
                  No analysis data available
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedTest && tests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No test results available yet. Create a test first!</p>
        </div>
      )}
    </div>
  )
}

export default TestResults
