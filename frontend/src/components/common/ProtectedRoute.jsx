import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Support role aliases: 'ngo' matches 'ngo_admin', etc.
  const roleMatches = (required, actual) => {
    if (!required) return true;
    if (required === actual) return true;
    if (required === 'ngo' && actual === 'ngo_admin') return true;
    if (required === 'ngo_admin' && actual === 'ngo') return true;
    return false;
  };

  if (requiredRole && !roleMatches(requiredRole, role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
