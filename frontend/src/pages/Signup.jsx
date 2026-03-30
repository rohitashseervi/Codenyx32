import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { ArrowRight, ArrowLeft, Chrome, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { user, setRole, setProfile, loginWithGoogle, logout } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({})
 
  React.useEffect(() => {
    if (user && step === 2) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        name: prev.name || user.displayName || ''
      }));
    }
  }, [user, step]);

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true)
      await loginWithGoogle()
      // loginWithGoogle sets the user in context; the page will re-render
      // and show the role selection step automatically
    } catch (error) {
      console.error('Google sign-up failed:', error)
      toast.error('Google sign-up failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const roles = [
    {
      id: 'ngo_admin',
      name: 'NGO Admin',
      description: 'Manage students, volunteers, and track educational outcomes',
      icon: '🏢',
    },
    {
      id: 'volunteer',
      name: 'Volunteer Teacher',
      description: 'Create and teach learning sessions to help students',
      icon: '👨‍🏫',
    },
    {
      id: 'mentor',
      name: 'Mentor',
      description: 'Provide personalized guidance and support to students',
      icon: '🎯',
    },
    {
      id: 'student',
      name: 'Student',
      description: 'Learn, complete assignments, and grow with support',
      icon: '📚',
    },
  ]

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    setStep(2)
  }

  const getRoleFormFields = () => {
    const baseFields = [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
    ]

    const roleSpecificFields = {
      ngo_admin: [
        { name: 'organizationName', label: 'Organization Name', type: 'text', required: true },
        { name: 'registrationNumber', label: 'Registration/License Number', type: 'text', required: true },
        { name: 'location', label: 'Location/City', type: 'text', required: true },
        { name: 'studentsCount', label: 'Number of Students', type: 'number', required: false },
        {
          name: 'operatingYears',
          label: 'Years in Operation',
          type: 'number',
          required: false,
        },
      ],
      volunteer: [
        { name: 'expertise', label: 'Area of Expertise', type: 'text', required: true },
        { name: 'experience', label: 'Years of Teaching Experience', type: 'number', required: false },
        { name: 'qualifications', label: 'Qualifications', type: 'textarea', required: false },
        { name: 'availability', label: 'Weekly Availability (hours)', type: 'number', required: false },
      ],
      mentor: [
        { name: 'expertise', label: 'Area of Expertise', type: 'text', required: true },
        { name: 'experience', label: 'Years of Experience', type: 'number', required: false },
        { name: 'qualifications', label: 'Educational Background', type: 'textarea', required: false },
        { name: 'availability', label: 'Weekly Availability (hours)', type: 'number', required: false },
      ],
      student: [
        { name: 'grade', label: 'Current Grade/Level', type: 'text', required: true },
        { name: 'school', label: 'School Name', type: 'text', required: false },
        { name: 'focusAreas', label: 'Areas You Want to Focus On', type: 'textarea', required: false },
      ],
    }

    return [...baseFields, ...(roleSpecificFields[selectedRole] || [])]
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedRole || !user) {
      toast.error('Please complete all steps')
      return
    }

    try {
      setLoading(true)

      const payload = {
        uid: user.uid,
        email: formData.email || user.email,
        displayName: formData.name || user.displayName,
        role: selectedRole,
        profileData: {
          name: formData.name || user.displayName,
          ...formData,
        },
      }

      await api.auth.register(payload)
      const response = await api.auth.getMe()
      const { user: backendUser } = response.data
      setProfile(backendUser?.profile || null)
      setRole(backendUser?.role || null)
      toast.success('Account created successfully!')
      navigate(`/${selectedRole}/dashboard`, { replace: true })
    } catch (error) {
      console.error('Signup error:', error)
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to create account. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fields = getRoleFormFields()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">GZ</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">
            {!user ? 'Sign up to get started' : `Step ${step} of 2 - ${step === 1 ? 'Choose your role' : 'Fill in your details'}`}
          </p>
        </div>

        {/* Progress bar - only shown after Google sign-in */}
        {user && (
          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        )}

        {/* Step 0: Google Sign-Up (shown when not authenticated) */}
        {!user && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 text-lg mb-6"
            >
              <Chrome className="w-6 h-6 text-blue-600" />
              {googleLoading ? 'Signing in...' : 'Sign up with Google'}
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">Already have an account?</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
            >
              Sign in instead
            </button>
          </div>
        )}

        {/* Step 1: Select Role */}
        {user && step === 1 && (
          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="w-full p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-3xl">{role.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{role.name}</h3>
                      <p className="text-gray-600 text-sm">{role.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Fill Details */}
        {user && step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {/* Header info */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {roles.find((r) => r.id === selectedRole)?.name} Details
              </h2>
              <button
                type="button"
                onClick={async () => { await logout(); navigate('/signup'); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Switch account
              </button>
            </div>
            <div className="space-y-4 mb-6">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="label">
                    {field.label}
                    {field.required && <span className="text-danger-600">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      disabled={field.disabled}
                      placeholder={field.label}
                      rows="3"
                      className="input-field resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || (field.disabled ? user?.email : '')}
                      onChange={handleInputChange}
                      disabled={field.disabled}
                      placeholder={field.label}
                      className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Terms */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1" />
                <span className="text-sm text-blue-900">
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setSelectedRole('')
                  setFormData({})
                }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" message="" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup
