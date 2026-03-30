import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { user, setRole, setProfile, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  const roles = [
    {
      id: 'ngo',
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
      { name: 'email', label: 'Email', type: 'email', required: false, disabled: true },
    ]

    const roleSpecificFields = {
      ngo: [
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
        email: user.email,
        firebaseUid: user.uid,
        role: selectedRole,
        profile: {
          name: formData.name || user.displayName,
          ...formData,
        },
      }

      const response = await api.auth.register(payload)

      // Update auth context
      setRole(selectedRole)
      setProfile(response.data.profile)

      toast.success('Account created successfully!')
      navigate(`/${selectedRole}/dashboard`, { replace: true })
    } catch (error) {
      console.error('Signup error:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create account. Please try again.')
      }
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
          <p className="text-gray-600">Step {step} of 3 - Choose your role</p>
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

        {/* Step 2: Fill Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {roles.find((r) => r.id === selectedRole)?.name} Details
            </h2>

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
