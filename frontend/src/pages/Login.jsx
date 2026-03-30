import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Chrome, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithGoogle, isAuthenticated, role, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(`/${role}/dashboard`, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const result = await loginWithGoogle()

      if (result.isNewUser) {
        navigate('/signup', { replace: true })
      } else {
        navigate(`/${result.role}/dashboard`, { replace: true })
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Failed to login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">GZ</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to GapZero</h1>
          <p className="text-gray-600">Sign in to continue to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 mb-4"
          >
            <Chrome className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In - Coming Soon */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-700 font-medium opacity-50 cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            Email Sign In (Coming Soon)
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">New to GapZero?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Sign in with Google to get started. You'll be able to select your role in the next step.
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• NGO Admins: Manage students and volunteers</li>
            <li>• Volunteers: Create and teach learning sessions</li>
            <li>• Mentors: Guide and track student progress</li>
            <li>• Students: Learn and complete assessments</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
