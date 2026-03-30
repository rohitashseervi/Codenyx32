import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { Send, Loader, ChevronDown, Edit2, Trash2, Save } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const CreateTest = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(20)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [questions, setQuestions] = useState([])
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (sessionId) {
      fetchSessionInfo()
    }
  }, [sessionId])

  const fetchSessionInfo = async () => {
    try {
      setLoading(true)
      const response = await api.volunteer.getSessions({ sessionId })
      const session = response.data.data?.[0] || response.data?.[0]
      setSessionInfo(session)
    } catch (error) {
      console.error('Failed to fetch session info:', error)
      toast.error('Failed to load session information')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTest = async () => {
    try {
      setGenerating(true)

      // Mock AI test generation - replace with actual API call
      const mockQuestions = Array.from({ length: numQuestions }, (_, i) => ({
        id: i + 1,
        question: `Sample Question ${i + 1} (${difficulty} difficulty): What is the answer to this educational question?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: 'This is the explanation for why this answer is correct.',
      }))

      setGeneratedQuestions(mockQuestions)
      setQuestions(mockQuestions)
      setShowPreview(true)
      toast.success('Test generated successfully!')
    } catch (error) {
      console.error('Failed to generate test:', error)
      toast.error('Failed to generate test')
    } finally {
      setGenerating(false)
    }
  }

  const handleEditQuestion = (questionId) => {
    const question = questions.find((q) => q.id === questionId)
    setEditingQuestion({ ...question })
  }

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuestions(
        questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))
      )
      setEditingQuestion(null)
      toast.success('Question updated')
    }
  }

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
    toast.success('Question deleted')
  }

  const handleSendToStudents = async () => {
    if (questions.length === 0) {
      toast.error('Please generate questions first')
      return
    }

    try {
      setSending(true)
      const testData = {
        sessionId: sessionId || null,
        topic: sessionInfo?.topic || 'Test',
        difficulty,
        questions,
        createdAt: new Date(),
      }

      await api.volunteer.createTest(testData)
      toast.success('Test sent to students!')
      window.location.href = '/volunteer/sessions'
    } catch (error) {
      console.error('Failed to send test:', error)
      toast.error('Failed to send test to students')
    } finally {
      setSending(false)
    }
  }

  if (loading && sessionId) {
    return <LoadingSpinner />
  }

  const difficultyDescriptions = {
    easy: 'Basic concept understanding and recall questions',
    medium: 'Application of concepts and problem-solving',
    hard: 'Analysis, synthesis, and critical thinking questions',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Test</h1>
        <p className="text-gray-600 mt-1">Generate and customize questions for your class</p>
      </div>

      {/* Session Info */}
      {sessionInfo && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Session</p>
              <p className="text-lg font-semibold text-gray-900">{sessionInfo.topic || 'Class Session'}</p>
            </div>
            <p className="text-sm text-blue-600">
              {new Date(sessionInfo.scheduledDate || sessionInfo.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Difficulty Selector */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Difficulty Level
          </label>
          <div className="space-y-2">
            {['easy', 'medium', 'hard'].map((level) => (
              <label key={level} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900 capitalize">{level}</p>
                  <p className="text-xs text-gray-600">
                    {difficultyDescriptions[level]}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Number of Questions */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Number of Questions
          </label>
          <div className="space-y-4">
            <input
              type="range"
              min="10"
              max="30"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Questions</span>
              <span className="text-2xl font-bold text-blue-600">{numQuestions}</span>
            </div>
            <p className="text-xs text-gray-600">
              Recommended: 20 questions for a balanced assessment
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Ready to Generate?</p>
            <p className="text-xs text-gray-600">
              Create {numQuestions} {difficulty} difficulty questions
            </p>
          </div>
          <button
            onClick={handleGenerateTest}
            disabled={generating}
            className="btn btn-primary w-full flex items-center justify-center gap-2 mt-4"
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Test'
            )}
          </button>
        </div>
      </div>

      {/* Questions Preview */}
      {showPreview && questions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Preview Questions ({questions.length})
            </h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Collapse
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-2 ml-4">
                      {q.options.map((option, optIdx) => (
                        <label key={optIdx} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={optIdx}
                            disabled
                            className="w-3 h-3"
                          />
                          <span className={optIdx === q.correctAnswer ? 'font-medium text-green-600' : 'text-gray-700'}>
                            {option}
                            {optIdx === q.correctAnswer && ' ✓'}
                          </span>
                        </label>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-gray-600 mt-3 p-2 bg-blue-50 rounded">
                        <span className="font-medium">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(q.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit question"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Question
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={editingQuestion.question}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, question: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {editingQuestion.options.map((option, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options]
                          newOptions[idx] = e.target.value
                          setEditingQuestion({ ...editingQuestion, options: newOptions })
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    value={editingQuestion.correctAnswer}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, correctAnswer: parseInt(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingQuestion.options.map((_, idx) => (
                      <option key={idx} value={idx}>
                        Option {String.fromCharCode(65 + idx)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation
                  </label>
                  <textarea
                    value={editingQuestion.explanation || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveQuestion}
                  className="btn btn-primary flex items-center gap-2 flex-1"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send to Students Section */}
      {questions.length > 0 && (
        <div className="card border-t-4 border-green-500 bg-green-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Send?</h3>
              <p className="text-gray-600">
                This test will be sent to all students in the class with a notification email.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">{questions.length}</span> questions • <span className="font-medium">{difficulty}</span> difficulty
              </p>
            </div>
            <button
              onClick={handleSendToStudents}
              disabled={sending}
              className="btn btn-success flex items-center gap-2 whitespace-nowrap"
            >
              {sending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to Students
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 && !generating && (
        <div className="text-center py-12">
          <p className="text-gray-600">Configure your test settings and click "Generate Test" to get started.</p>
        </div>
      )}
    </div>
  )
}

export default CreateTest
