import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { ArrowRight, ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated, role: authRole } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    displayName: '',
  })
  const [profileData, setProfileData] = useState({})

  useEffect(() => {
    if (isAuthenticated && authRole) {
      const dashboardRole = authRole === 'ngo_admin' ? 'ngo' : authRole
      navigate(`/${dashboardRole}/dashboard`, { replace: true })
    }
  }, [isAuthenticated, authRole, navigate])

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

  const handleCredentialChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCredentialsNext = (e) => {
    e.preventDefault()
    if (!credentials.email || !credentials.password || !credentials.displayName) {
      toast.error('Please fill in all fields')
      return
    }
    if (credentials.password.length < 4) {
      toast.error('Password must be at least 4 characters')
      return
    }
    setStep(3)
  }

  const getRoleFormFields = () => {
    const roleSpecificFields = {
      ngo_admin: [
        { name: 'organizationName', label: 'Organization Name', type: 'text', required: true },
        { name: 'registrationNumber', label: 'Registration/License Number', type: 'text', required: true },
        { name: 'location', label: 'Location/City', type: 'text', required: true },
        { name: 'studentsCount', label: 'Number of Students', type: 'number', required: false },
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
      ],
      student: [
        { name: 'grade', label: 'Current Grade (1-5)', type: 'number', required: true },
        { name: 'school', label: 'School Name', type: 'text', required: false },
        { name: 'language', label: 'Preferred Language', type: 'text', required: false },
      ],
    }
    return roleSpecificFields[selectedRole] || []
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const payload = {
        email: credentials.email,
        password: credentials.password,
        displayName: credentials.displayName,
        role: selectedRole,
        profileData: profileData,
      }

      const result = await register(payload)
      const dashboardRole = result.role === 'ngo_admin' ? 'ngo' : result.role
      navigate(`/${dashboardRole}/dashboard`, { replace: true })
    } catch (error) {
      console.error('Signup error:', error)
      // Error toast is handled in AuthContext
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
            Step {step} of 3 -{' '}
            {step === 1 ? 'Choose your role' : step === 2 ? 'Your credentials' : 'Profile details'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>

        {/* Step 1: Select Role */}
        {step === 1 && (
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

        {/* Step 2: Email & Password */}
        {step === 2 && (
          <form onSubmit={handleCredentialsNext} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Credentials</h2>

            <div className="space-y-4 mb-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={credentials.displayName}
                    onChange={handleCredentialChange}
                    placeholder="Your full name"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleCredentialChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={credentials.password}
                    onChange={handleCredentialChange}
                    placeholder="At least 4 characters"
                    required
                    minLength={4}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setSelectedRole('')
                }}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Role-Specific Profile */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {roles.find((r) => r.id === selectedRole)?.name} Details
            </h2>

            <div className="space-y-4 mb-6">
              {fields.length === 0 ? (
                <p className="text-gray-600">No additional details needed. Click Create Account to finish.</p>
              ) : (
                fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={profileData[field.name] || ''}
                        onChange={handleProfileChange}
                        placeholder={field.label}
                        rows="3"
                        required={field.required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={profileData[field.name] || ''}
                        onChange={handleProfileChange}
                        placeholder={field.label}
                        required={field.required}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      />
                    )}
                  </div>
                ))
              )}
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

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:from-primary-700 hover:to-secondary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Creating...'
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
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
