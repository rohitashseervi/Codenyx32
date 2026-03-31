import React, { createContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // On mount, check if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('gapzero_token')
    const savedUser = localStorage.getItem('gapzero_user')
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setRole(userData.role)
        setProfile(userData.profile)
        setIsAuthenticated(true)
      } catch (e) {
        localStorage.removeItem('gapzero_token')
        localStorage.removeItem('gapzero_user')
      }
    }
    setLoading(false)
  }, [])

  // Login with email and password
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const response = await api.auth.login({ email, password })
      const { token, user: userData } = response.data

      // Save token
      localStorage.setItem('gapzero_token', token)
      localStorage.setItem('gapzero_user', JSON.stringify(userData))

      setUser(userData)
      setRole(userData.role)
      setProfile(userData.profile)
      setIsAuthenticated(true)
      toast.success('Logged in successfully!')
      return { user: userData, role: userData.role, isNewUser: false }
    } catch (error) {
      console.error('Login error:', error)
      const msg = error.response?.data?.error || 'Failed to login. Please try again.'
      toast.error(msg)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Register
  const register = useCallback(async (data) => {
    try {
      setLoading(true)
      const response = await api.auth.register(data)
      const { token, user: userData } = response.data

      // Save token
      localStorage.setItem('gapzero_token', token)
      localStorage.setItem('gapzero_user', JSON.stringify(userData))

      setUser(userData)
      setRole(userData.role)
      setProfile(userData.profile)
      setIsAuthenticated(true)
      toast.success('Account created successfully!')
      return { user: userData, role: userData.role }
    } catch (error) {
      console.error('Register error:', error)
      const msg = error.response?.data?.error || 'Failed to register. Please try again.'
      toast.error(msg)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    localStorage.removeItem('gapzero_token')
    localStorage.removeItem('gapzero_user')
    setUser(null)
    setRole(null)
    setProfile(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully!')
  }, [])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.auth.getMe()
      const userData = response.data.user || response.data
      setProfile(userData.profile)
      setRole(userData.role)
      localStorage.setItem('gapzero_user', JSON.stringify(userData))
      return userData
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      throw error
    }
  }, [])

  const value = {
    user,
    role,
    profile,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProfile,
    setRole,
    setProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
