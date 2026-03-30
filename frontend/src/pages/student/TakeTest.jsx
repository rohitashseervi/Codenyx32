import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TakeTest = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true)
        const response = await api.student.getTest(testId)
        setTest(response.data)
        setTimeRemaining(response.data.timeLimit * 60) // Convert minutes to seconds
        // Initialize answers
        const initialAnswers = {}
        response.data.questions?.forEach((q, idx) => {
          initialAnswers[idx] = null
        })
        setAnswers(initialAnswers)
      } catch (err) {
        console.error('Failed to fetch test:', err)
        toast.error('Failed to load test')
        navigate('/student/tests')
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [testId, navigate])

  // Timer effect
  useEffect(() => {
    if (!test || timeRemaining === null) return

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
  }, [test, timeRemaining])

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
    try {
      setSubmitting(true)
      const submitData = {
        answers: Object.entries(answers).map(([qIdx, aIdx]) => ({
          questionIndex: parseInt(qIdx),
          selectedOption: aIdx,
        })),
        timeSpent: test.timeLimit * 60 - timeRemaining,
      }

      const response = await api.student.submitTest(testId, submitData)
      toast.success('Test submitted successfully!')

      // Navigate to scorecard
      navigate(`/student/scorecard/${testId}`, { state: response.data })
    } catch (err) {
      console.error('Failed to submit test:', err)
      toast.error('Failed to submit test')
    } finally {
      setSubmitting(false)
    }
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
              onClick={() => setShowSubmitConfirm(true)}
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

export default TakeTest
