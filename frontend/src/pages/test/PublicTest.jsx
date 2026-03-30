import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { ChevronLeft, ChevronRight, Send, Clock, LogOut } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const PublicTest = () => {
  const { testId: urlTestId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [testId, setTestId] = useState(urlTestId || '')
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [testStarted, setTestStarted] = useState(!!urlTestId)

  // Fetch test by ID
  const handleFetchTest = async () => {
    if (!testId.trim()) {
      toast.error('Please enter a test ID')
      return
    }

    try {
      setLoading(true)
      const response = await api.test.getByTestId(testId)
      setTest(response.data)
      setTimeRemaining((response.data.timeLimit || 30) * 60) // Convert minutes to seconds
      const initialAnswers = {}
      response.data.questions?.forEach((q, idx) => {
        initialAnswers[idx] = null
      })
      setAnswers(initialAnswers)
      setTestStarted(true)
      toast.success('Test loaded successfully!')
    } catch (err) {
      console.error('Failed to load test:', err)
      toast.error(err.response?.data?.message || 'Test not found or not available')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch if testId is in URL
  useEffect(() => {
    if (urlTestId && !test) {
      handleFetchTest()
    }
  }, [urlTestId])

  // Timer effect
  useEffect(() => {
    if (!test || timeRemaining === null || !testStarted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [test, timeRemaining, testStarted])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours > 0 ? hours + ':' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }))
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit your test')
      navigate('/login')
      return
    }

    try {
      setSubmitting(true)
      const submitData = {
        answers: Object.entries(answers).map(([qIdx, aIdx]) => ({
          questionIndex: parseInt(qIdx),
          selectedOption: aIdx,
        })),
        timeSpent: (test.timeLimit || 30) * 60 - timeRemaining,
      }

      const response = await api.test.submit(testId, submitData)
      toast.success('Test submitted successfully!')
      navigate(`/student/scorecard/${testId}`, { state: response.data })
    } catch (err) {
      console.error('Failed to submit test:', err)
      toast.error(err.response?.data?.message || 'Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  // Not authenticated state - show login prompt at top
  if (!isAuthenticated && testStarted && test) {
    return (
      <div className="space-y-6">
        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-700 mb-4">
                You need to be logged in to take and submit this test. Your answers will be saved with your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-secondary"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Show test preview */}
        {test && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{test.topic}</h2>
            <p className="text-gray-600 mb-4">Subject: {test.subject}</p>
            <p className="text-gray-700 mb-4">
              This test has {test.questions?.length || 20} questions and should take about {test.timeLimit || 30} minutes.
            </p>
          </div>
        )}
      </div>
    )
  }

  // Test ID input screen
  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Take a Test</h1>
            <p className="text-gray-600">Enter the test ID to begin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Test ID</label>
              <input
                type="text"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="Enter test ID from email"
                className="input-field text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleFetchTest()}
              />
            </div>

            <button
              onClick={handleFetchTest}
              disabled={loading}
              className="btn-primary w-full text-lg py-3"
            >
              {loading ? 'Loading...' : 'Start Test'}
            </button>

            {!isAuthenticated && (
              <div className="text-center py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">New here?</p>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Create an account to track your progress
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingSpinner message="Loading test..." />
  if (!test || !test.questions) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Test not found</p>
      </div>
    )
  }

  const question = test.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / test.questions.length) * 100
  const answered = Object.values(answers).filter((a) => a !== null).length

  return (
    <div className="space-y-6">
      {/* Header with Progress and Timer */}
      <div className="card bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{test.topic}</h1>
            <p className="text-white/90">{test.subject}</p>
          </div>
          <div className="text-right bg-white/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-bold font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <p className="text-xs text-white/80">Time Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-white/90 mt-2">
          Question {currentQuestion + 1} of {test.questions.length} ({answered} answered)
        </p>
      </div>

      {/* Question Card */}
      <div className="card border-2 border-primary-200">
        {/* Question Text */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Question {currentQuestion + 1}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{question.text}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              className={`w-full text-left p-4 rounded-lg border-2 text-lg font-medium transition-all ${
                answers[currentQuestion] === idx
                  ? 'bg-primary-100 border-primary-600 text-primary-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion] === idx
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-400'
                }`}>
                  {answers[currentQuestion] === idx && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation and Submit */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-lg flex items-center justify-center gap-2 transition-colors ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentQuestion === test.questions.length - 1 ? (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please log in to submit your test')
                  navigate('/login')
                } else {
                  setShowSubmitConfirm(true)
                }
              }}
              className="flex-1 btn-primary py-3 px-4 text-lg flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
              className="flex-1 btn-primary py-3 px-4 text-lg flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Test?</h2>
            <p className="text-gray-600 mb-6">
              You've answered {answered} out of {test.questions.length} questions.
              <br />
              Are you sure you want to submit now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicTest
