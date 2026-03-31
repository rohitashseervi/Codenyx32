import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  CheckCircle, Clock, Lock, TrendingUp, Play, BookOpen,
  Video, Award, ChevronDown, ChevronUp, Zap, BarChart3,
  RefreshCw, AlertCircle
} from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Setup Wizard ─────────────────────────────────────────────
const SetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [gradeGroup, setGradeGroup] = useState('')
  const [subjectA, setSubjectA] = useState('')
  const [subjectB, setSubjectB] = useState('')
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handlePreview = async () => {
    if (!gradeGroup || !subjectA || !subjectB) return
    try {
      const [resA, resB] = await Promise.all([
        api.learningPath.getCourses({ gradeGroup, subject: subjectA }),
        api.learningPath.getCourses({ gradeGroup, subject: subjectB })
      ])
      setPreview({
        [subjectA]: resA.data?.data || [],
        [subjectB]: resB.data?.data || []
      })
      setStep(3)
    } catch (e) {
      toast.error('Failed to load course preview')
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await api.learningPath.setup({ gradeGroup, subjectA, subjectB })
      toast.success(res.data?.message || 'Learning path created!')
      onComplete()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create learning path')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s}</div>
            {s < 3 && <div className={`w-16 h-1 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Grade Group */}
      {step === 1 && (
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Class Group</h2>
            <p className="text-gray-600 mt-2">Select the grade range you want to teach</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
            {[
              { value: '1-3', label: 'Grades 1 - 3', desc: 'Foundational concepts, phonics, basic math, nature study' },
              { value: '4-5', label: 'Grades 4 - 5', desc: 'Advanced concepts, comprehension, fractions, geography' }
            ].map(g => (
              <button
                key={g.value}
                onClick={() => { setGradeGroup(g.value); setStep(2) }}
                className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                  gradeGroup === g.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className="text-xl font-bold text-gray-900 mb-2">{g.label}</p>
                <p className="text-sm text-gray-600">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Subject Selection */}
      {step === 2 && (
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Subjects</h2>
            <p className="text-gray-600 mt-2">Pick one subject from each group (2 total)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Group A */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Group A — STEM</p>
              {['Math', 'Science'].map(s => (
                <button
                  key={s}
                  onClick={() => setSubjectA(s)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    subjectA === s
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${subjectA === s ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      {subjectA === s ? <CheckCircle className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full border-2 border-gray-400" />}
                    </div>
                    <span className="font-semibold text-gray-900">{s}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Group B */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Group B — Humanities</p>
              {['English', 'Social'].map(s => (
                <button
                  key={s}
                  onClick={() => setSubjectB(s)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    subjectB === s
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${subjectB === s ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
                      {subjectB === s ? <CheckCircle className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full border-2 border-gray-400" />}
                    </div>
                    <span className="font-semibold text-gray-900">{s}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-600 hover:text-gray-900">Back</button>
            <button
              onClick={handlePreview}
              disabled={!subjectA || !subjectB}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Preview Course Plan
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Confirm */}
      {step === 3 && preview && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Your 4-Week Course Plan</h2>
            <p className="text-gray-600 mt-2">Grades {gradeGroup} — {subjectA} + {subjectB}</p>
          </div>

          {[subjectA, subjectB].map(subj => (
            <div key={subj} className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {subj}
              </h3>
              <div className="space-y-3">
                {(preview[subj] || []).map((mod, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      W{mod.week}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{mod.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{mod.topic}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mod.sessions?.map((s, j) => (
                          <span key={j} className="text-xs bg-white border border-gray-200 rounded px-2 py-1">
                            {s.title} ({s.duration}min)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => setStep(2)} className="px-6 py-2 text-gray-600 hover:text-gray-900">Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {submitting ? 'Setting Up...' : 'Start This Learning Path'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Test Creation Modal ──────────────────────────────────────
const TestCreationModal = ({ session, onClose, onCreated }) => {
  const [difficulty, setDifficulty] = useState('medium')
  const [topic, setTopic] = useState(session.topic || '')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await api.learningPath.createTest(session._id, { difficulty, topic })
      toast.success(res.data?.message || 'Test created!')
      onCreated(res.data?.data)
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create test')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Create AI Test</h3>
          <p className="text-sm text-gray-600 mt-1">Generate 10 MCQs for your students</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter test topic..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'easy', label: 'Easy', color: 'green', desc: 'Basic recall' },
              { val: 'medium', label: 'Medium', color: 'yellow', desc: 'Application' },
              { val: 'hard', label: 'Hard', color: 'red', desc: 'Critical thinking' }
            ].map(d => (
              <button
                key={d.val}
                onClick={() => setDifficulty(d.val)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  difficulty === d.val
                    ? `border-${d.color}-500 bg-${d.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">{d.label}</p>
                <p className="text-xs text-gray-500">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <Zap className="w-4 h-4 inline mr-1" />
            AI will generate 10 MCQs using Gemini. The test will appear in students' dashboards automatically.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !topic.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
            {creating ? 'Generating...' : 'Generate Test'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session Results Panel ────────────────────────────────────
const SessionResults = ({ sessionId }) => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.learningPath.getSessionResults(sessionId)
        setResults(res.data?.data)
      } catch (e) {
        console.error('Failed to fetch results:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [sessionId])

  if (loading) return <div className="text-sm text-gray-500">Loading results...</div>
  if (!results) return <div className="text-sm text-gray-400">No test results yet</div>

  return (
    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Test Results
        </h4>
        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border">
          <span className="text-xs text-gray-500">Impact Score</span>
          <span className="text-lg font-bold text-blue-600">{results.stats.impactScore}/100</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-2">
          <p className="text-xs text-gray-500">Average</p>
          <p className="text-lg font-bold text-gray-900">{results.stats.averageScore}%</p>
        </div>
        <div className="bg-white rounded-lg p-2">
          <p className="text-xs text-gray-500">Highest</p>
          <p className="text-lg font-bold text-green-600">{results.stats.highestScore}%</p>
        </div>
        <div className="bg-white rounded-lg p-2">
          <p className="text-xs text-gray-500">Submissions</p>
          <p className="text-lg font-bold text-gray-900">{results.stats.totalSubmissions}</p>
        </div>
      </div>
      {results.submissions.length > 0 && (
        <div className="mt-3 space-y-1">
          {results.submissions.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-white rounded px-3 py-1.5">
              <span className="text-gray-700">{s.studentName}</span>
              <span className={`font-semibold ${s.score >= 70 ? 'text-green-600' : s.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {s.score}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Learning Path Component ─────────────────────────────
const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState(null)
  const [testModal, setTestModal] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchPath()
  }, [])

  const fetchPath = async () => {
    try {
      setLoading(true)
      const res = await api.learningPath.getMyPath()
      setLearningPath(res.data?.data)
    } catch (e) {
      console.error('Failed to fetch learning path:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async (sessionId) => {
    setActionLoading(prev => ({ ...prev, [sessionId]: 'starting' }))
    try {
      const res = await api.learningPath.startSession(sessionId)
      const meetLink = res.data?.meetLink
      toast.success('Session started!')
      if (meetLink) {
        window.open(meetLink, '_blank')
      }
      fetchPath()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to start session')
    } finally {
      setActionLoading(prev => ({ ...prev, [sessionId]: null }))
    }
  }

  const handleCompleteSession = async (sessionId) => {
    setActionLoading(prev => ({ ...prev, [sessionId]: 'completing' }))
    try {
      await api.learningPath.completeSession(sessionId)
      toast.success('Session completed! You can now create a test.')
      fetchPath()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to complete session')
    } finally {
      setActionLoading(prev => ({ ...prev, [sessionId]: null }))
    }
  }

  const handleCompleteModule = async (moduleIndex) => {
    setActionLoading(prev => ({ ...prev, [`mod-${moduleIndex}`]: true }))
    try {
      await api.learningPath.completeModule(moduleIndex)
      toast.success('Module completed!')
      fetchPath()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to complete module')
    } finally {
      setActionLoading(prev => ({ ...prev, [`mod-${moduleIndex}`]: false }))
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset your learning path? This will remove your current plan and let you start fresh.')) return
    try {
      await api.learningPath.reset()
      toast.success('Learning path reset')
      setLearningPath(null)
    } catch (e) {
      toast.error('Failed to reset')
    }
  }

  if (loading) return <LoadingSpinner />

  // No learning path — show setup wizard
  if (!learningPath) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Learning Path</h1>
          <p className="text-gray-600 mt-2">Choose your grade group and subjects to start a 4-week teaching journey</p>
        </div>
        <SetupWizard onComplete={fetchPath} />
      </div>
    )
  }

  // Calculate progress
  const totalMods = learningPath.totalModules || learningPath.modules.length
  const completedMods = learningPath.modules.filter(m => m.status === 'completed').length
  const progressPercent = totalMods > 0 ? Math.round((completedMods / totalMods) * 100) : 0

  const getSubjectColor = (subject) => {
    const colors = {
      Math: 'border-blue-500 bg-blue-50',
      Science: 'border-purple-500 bg-purple-50',
      English: 'border-green-500 bg-green-50',
      Social: 'border-orange-500 bg-orange-50'
    }
    return colors[subject] || 'border-gray-500 bg-gray-50'
  }

  const getSubjectBadge = (subject) => {
    const colors = {
      Math: 'bg-blue-100 text-blue-700',
      Science: 'bg-purple-100 text-purple-700',
      English: 'bg-green-100 text-green-700',
      Social: 'bg-orange-100 text-orange-700'
    }
    return colors[subject] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Path</h1>
          <p className="text-gray-600 mt-1">
            Grades {learningPath.grade} — {learningPath.subject} — 4 week course
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-medium transition-colors"
        >
          Reset Path
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Overall Progress</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-3">{progressPercent}%</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completedMods} of {totalMods} modules completed
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completedMods}</p>
          <p className="text-xs text-gray-500 mt-1">modules done</p>
        </div>
        <div className="card text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">Remaining</p>
          <p className="text-3xl font-bold text-blue-600">{totalMods - completedMods}</p>
          <p className="text-xs text-gray-500 mt-1">modules left</p>
        </div>
      </div>

      {/* Module Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Course Modules</h2>

        {learningPath.modules.map((mod, index) => {
          const isExpanded = expandedModule === index
          const isCurrent = mod.status === 'current'
          const isCompleted = mod.status === 'completed'
          const sessions = mod.sessionDetails || []

          return (
            <div
              key={index}
              className={`rounded-xl border-2 overflow-hidden transition-all ${
                isCompleted ? 'border-green-300 bg-green-50/30'
                  : isCurrent ? 'border-blue-400 bg-white ring-2 ring-blue-100'
                    : 'border-gray-200 bg-white opacity-75'
              }`}
            >
              {/* Module Header */}
              <button
                onClick={() => setExpandedModule(isExpanded ? null : index)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {isCompleted
                    ? <CheckCircle className="w-6 h-6 text-green-600" />
                    : isCurrent
                      ? <Play className="w-6 h-6 text-blue-600" />
                      : <Lock className="w-6 h-6 text-gray-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{mod.moduleName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSubjectBadge(mod.subject)}`}>
                      {mod.subject}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Week {mod.week}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{mod.topic}</p>
                </div>

                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">Done</span>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full animate-pulse">Active</span>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {/* Expanded Sessions */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-5 space-y-4">
                  {mod.description && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{mod.description}</p>
                  )}

                  {mod.learningOutcomes && mod.learningOutcomes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mod.learningOutcomes.map((lo, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                          {lo}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sessions List */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Sessions</p>
                    {sessions.length > 0 ? sessions.map((session) => (
                      <div key={session._id} className={`p-4 rounded-xl border ${
                        session.status === 'completed' ? 'border-green-200 bg-green-50/50'
                          : session.status === 'in_progress' ? 'border-yellow-200 bg-yellow-50/50'
                            : 'border-gray-200'
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{session.topic}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                session.status === 'completed' ? 'bg-green-100 text-green-700'
                                  : session.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {session.status === 'in_progress' ? 'In Progress' : session.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {session.duration}min • {new Date(session.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            {session.meetLink && session.status === 'in_progress' && (
                              <a
                                href={session.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                              >
                                <Video className="w-4 h-4" />
                                Join Google Meet
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {session.status === 'scheduled' && (isCurrent || isCompleted) && (
                              <button
                                onClick={() => handleStartSession(session._id)}
                                disabled={actionLoading[session._id] === 'starting'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {actionLoading[session._id] === 'starting'
                                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                                  : <Video className="w-4 h-4" />}
                                Start Session
                              </button>
                            )}
                            {session.status === 'in_progress' && (
                              <button
                                onClick={() => handleCompleteSession(session._id)}
                                disabled={actionLoading[session._id] === 'completing'}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {actionLoading[session._id] === 'completing'
                                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                                  : <CheckCircle className="w-4 h-4" />}
                                Mark Complete
                              </button>
                            )}
                            {session.status === 'completed' && !session.assessmentId && (
                              <button
                                onClick={() => setTestModal(session)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-1.5"
                              >
                                <Zap className="w-4 h-4" />
                                Create AI Test
                              </button>
                            )}
                            {session.status === 'completed' && session.assessmentId && (
                              <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                Test Created
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Impact Score & Results */}
                        {session.status === 'completed' && session.assessmentId && (
                          <SessionResults sessionId={session._id} />
                        )}
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400">No sessions loaded</p>
                    )}
                  </div>

                  {/* Module Complete Button */}
                  {(isCurrent || mod.status === 'upcoming') && !isCompleted && (
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleCompleteModule(index)}
                        disabled={actionLoading[`mod-${index}`]}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                      >
                        {actionLoading[`mod-${index}`]
                          ? <RefreshCw className="w-4 h-4 animate-spin" />
                          : <CheckCircle className="w-4 h-4" />}
                        Mark Module as Completed
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Test Creation Modal */}
      {testModal && (
        <TestCreationModal
          session={testModal}
          onClose={() => setTestModal(null)}
          onCreated={() => fetchPath()}
        />
      )}
    </div>
  )
}

export default LearningPath
