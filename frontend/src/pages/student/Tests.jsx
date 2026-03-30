import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Zap, CheckCircle, Clock } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Tests = () => {
  const navigate = useNavigate()
  const [tests, setTests] = useState({ pending: [], completed: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true)
        const pendingRes = await api.student.getTests({ status: 'pending' })
        const completedRes = await api.student.getTests({ status: 'completed' })

        setTests({
          pending: pendingRes.data.tests || [],
          completed: completedRes.data.tests || [],
        })
      } catch (err) {
        console.error('Failed to fetch tests:', err)
        toast.error('Failed to load tests')
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  if (loading) return <LoadingSpinner message="Loading tests..." />

  const TestCard = ({ test, isPending = true }) => (
    <div className={`card-hover border-2 ${isPending ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{test.topic}</h3>
          <p className="text-gray-600">{test.subject}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
          isPending
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {isPending ? '⏳ Pending' : '✓ Completed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Difficulty</p>
          <p className="font-bold text-lg text-gray-900">
            {test.difficulty === 'easy' ? '🟢' : test.difficulty === 'medium' ? '🟡' : '🔴'} {test.difficulty}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Questions</p>
          <p className="font-bold text-lg text-gray-900">{test.totalQuestions || 20}</p>
        </div>
      </div>

      {isPending && (
        <>
          {test.deadline && (
            <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Due: {new Date(test.deadline).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={() => navigate(`/student/tests/${test.id}/take`)}
            className="btn-primary w-full text-lg py-3 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Take Test Now
          </button>
        </>
      )}

      {!isPending && (
        <>
          <div className="bg-white rounded-lg p-3 mb-3">
            <p className="text-xs text-gray-600 mb-1">Your Score</p>
            <p className="font-bold text-2xl text-primary-600">{test.score}%</p>
          </div>
          <button
            onClick={() => navigate(`/student/scorecard/${test.id}`)}
            className="btn-secondary w-full text-lg py-3"
          >
            View Scorecard
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-600" />
          My Tests
        </h1>
        <p className="text-gray-600 text-lg">Challenge yourself and track your progress</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium text-lg transition-colors ${
            activeTab === 'pending'
              ? 'text-yellow-600 border-b-4 border-yellow-600'
              : 'text-gray-600'
          }`}
        >
          ⏳ Pending ({tests.pending.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium text-lg transition-colors ${
            activeTab === 'completed'
              ? 'text-green-600 border-b-4 border-green-600'
              : 'text-gray-600'
          }`}
        >
          ✓ Completed ({tests.completed.length})
        </button>
      </div>

      {/* Tests Grid */}
      {activeTab === 'pending' && (
        <div>
          {tests.pending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.pending.map((test) => (
                <TestCard key={test.id} test={test} isPending={true} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Tests</h3>
              <p className="text-gray-600">Great job staying on top of your tests!</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          {tests.completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.completed.map((test) => (
                <TestCard key={test.id} test={test} isPending={false} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Completed Tests</h3>
              <p className="text-gray-600">Complete some pending tests to see your results!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Tests
