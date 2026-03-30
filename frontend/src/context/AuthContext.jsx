import React, { createContext, useState, useEffect, useCallback } from 'react'
import { signOut, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Refresh user profile from backend
  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.auth.getMe()
      setProfile(response.data.profile || response.data)
      setRole(response.data.role || response.data.profile?.role)
      return response.data
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      throw error
    }
  }, [])

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const token = await user.getIdToken()

      try {
        // Try to verify token with backend and get user profile
        const response = await api.auth.login({ token })
        setProfile(response.data.profile || response.data)
        setRole(response.data.role || response.data.profile?.role)
        setUser(user)
        setIsAuthenticated(true)
        toast.success('Logged in successfully!')
        return { user, role: response.data.role || response.data.profile?.role, isNewUser: false }
      } catch (error) {
        // User doesn't exist in backend yet
        if (error.response?.status === 404) {
          setUser(user)
          setIsAuthenticated(true)
          return { user, role: null, isNewUser: true }
        }
        throw error
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to login. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await signOut(auth)
      setUser(null)
      setRole(null)
      setProfile(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully!')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser)
          // Try to fetch user profile from backend
          try {
            const response = await api.auth.getMe()
            setProfile(response.data.profile || response.data)
            setRole(response.data.role || response.data.profile?.role)
            setIsAuthenticated(true)
          } catch (error) {
            // User exists in Firebase but not in backend
            if (error.response?.status === 404) {
              setIsAuthenticated(true)
              setRole(null)
            } else {
              // Other errors - might be network issue
              console.error('Error fetching profile:', error)
            }
          }
        } else {
          setUser(null)
          setRole(null)
          setProfile(null)
          setIsAuthenticated(false)
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    role,
    profile,
    loading,
    isAuthenticated,
    loginWithGoogle,
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
