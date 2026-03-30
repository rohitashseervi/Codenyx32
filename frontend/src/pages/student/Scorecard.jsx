import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { CheckCircle, XCircle, Share2, MessageCircle, Zap } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Scorecard = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [scorecard, setScorecard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        setLoading(true)
        const response = await api.test.getScorecard(testId)
        setScorecard(response.data)
      } catch (err) {
        console.error('Failed to fetch scorecard:', err)
        setError('Failed to load scorecard')
        toast.error('Failed to load scorecard')
      } finally {
        setLoading(false)
      }
    }

    if (testId) fetchScorecard()
  }, [testId])

  if (loading) return <LoadingSpinner message="Loading your scorecard..." />
  if (error) {
    return (
      <div className="card bg-danger-50 border-2 border-danger-200">
        <p className="text-danger-700">{error}</p>
      </div>
    )
  }

  if (!scorecard) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Scorecard not found</p>
      </div>
    )
  }

  const score = scorecard.score || 0
  const totalQuestions = scorecard.totalQuestions || 20
  const correctAnswers = Math.round((score / 100) * totalQuestions)
  const percentage = scorecard.percentage || score
  const masteryLevel = scorecard.masteryLevel || (
    percentage >= 80 ? 'Mastered' : percentage >= 60 ? 'Proficient' : percentage >= 40 ? 'Learning' : 'Not Mastered'
  )

  const getMasteryColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'mastered':
        return { bg: 'bg-success-100', border: 'border-success-300', text: 'text-success-700' }
      case 'proficient':
        return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' }
      case 'learning':
        return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' }
      default:
        return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' }
    }
  }

  const masteryColor = getMasteryColor(masteryLevel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-600" />
          Test Results
        </h1>
        <p className="text-gray-600">Great effort! Check your performance below.</p>
      </div>

      {/* Score Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border-4 border-primary-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{scorecard.topic}</h2>

          {/* Big Score Display */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="#e0e7ff"
                  strokeWidth="12"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={masteryColor.text === 'text-success-700' ? '#10b981' :
                           masteryColor.text === 'text-blue-700' ? '#3b82f6' :
                           masteryColor.text === 'text-yellow-700' ? '#f59e0b' : '#9ca3af'}
                  strokeWidth="12"
                  strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 88} ${2 * Math.PI * 88}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-primary-700">{percentage}%</p>
                <p className="text-sm text-gray-600 mt-2">Score</p>
              </div>
            </div>
          </div>

          {/* Mastery Badge */}
          <div className={`inline-block px-6 py-3 rounded-full border-2 mb-6 ${masteryColor.bg} ${masteryColor.border} ${masteryColor.text} font-bold text-lg`}>
            {masteryLevel === 'Mastered' && '🏆'} {masteryLevel}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correct</p>
              <p className="text-2xl font-bold text-success-600">{correctAnswers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Wrong</p>
              <p className="text-2xl font-bold text-danger-600">{totalQuestions - correctAnswers}</p>
            </div>
          </div>

          {/* Encouragement */}
          <div className="mt-6 text-center">
            {percentage >= 80 && (
              <p className="text-xl font-semibold text-success-700">🌟 Excellent work! You mastered this topic!</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-xl font-semibold text-blue-700">💪 Good job! Keep practicing to master this!</p>
            )}
            {percentage >= 40 && percentage < 60 && (
              <p className="text-xl font-semibold text-yellow-700">📈 Nice try! Review the concepts and try again!</p>
            )}
            {percentage < 40 && (
              <p className="text-xl font-semibold text-gray-700">🚀 Keep learning! Ask your mentor for help!</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {percentage < 50 && (
          <button className="btn-primary flex items-center justify-center gap-2 text-lg py-3">
            <MessageCircle className="w-5 h-5" />
            Ask Mentor for Help
          </button>
        )}
        <button
          onClick={() => {
            toast.success('Test shared with mentor!')
          }}
          className="btn-secondary flex items-center justify-center gap-2 text-lg py-3"
        >
          <Share2 className="w-5 h-5" />
          Share with Mentor
        </button>
      </div>

      {/* Detailed Results */}
      {scorecard.questionBreakdown && scorecard.questionBreakdown.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question-by-Question Breakdown</h2>
          <div className="space-y-4">
            {scorecard.questionBreakdown.map((qb, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  qb.isCorrect
                    ? 'bg-success-50 border-success-200'
                    : 'bg-danger-50 border-danger-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {qb.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">Question {idx + 1}</p>
                    <p className="text-gray-700 mb-3">{qb.question}</p>
                  </div>
                </div>

                <div className="ml-9 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <strong>Your answer:</strong> {qb.selectedAnswer}
                    </p>
                  </div>
                  {!qb.isCorrect && (
                    <div>
                      <p className="text-success-700">
                        <strong>Correct answer:</strong> {qb.correctAnswer}
                      </p>
                    </div>
                  )}
                  {qb.explanation && (
                    <div className="mt-3 p-3 bg-white/50 rounded border border-gray-300">
                      <p className="text-gray-700"><strong>Explanation:</strong> {qb.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Next Steps</h3>
        <ul className="space-y-2 text-gray-700">
          {percentage >= 80 && (
            <>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Move to the next topic to continue learning</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Help other students by sharing tips</span>
              </li>
            </>
          )}
          {percentage < 80 && percentage >= 50 && (
            <>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Review the concepts you found challenging</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Take another practice test to improve</span>
              </li>
            </>
          )}
          {percentage < 50 && (
            <>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Schedule a session with your mentor</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Review the learning materials step by step</span>
              </li>
            </>
          )}
        </ul>
        <button
          onClick={() => navigate('/student/tests')}
          className="btn-primary w-full mt-4"
        >
          Back to Tests
        </button>
      </div>
    </div>
  )
}

export default Scorecard
