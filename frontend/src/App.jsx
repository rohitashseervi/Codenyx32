import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

// NGO Pages
import NGODashboard from './pages/ngo/Dashboard'
import Students from './pages/ngo/Students'
import StudentDetail from './pages/ngo/StudentDetail'
import Volunteers from './pages/ngo/Volunteers'
import Mentors from './pages/ngo/Mentors'
import Reports from './pages/ngo/Reports'
import Settings from './pages/ngo/Settings'

// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard'
import MentorMyStudents from './pages/mentor/MyStudents'
import MentorStudentProgress from './pages/mentor/StudentProgress'
import MentorAlerts from './pages/mentor/Alerts'
import MentorSchedule from './pages/mentor/Schedule'
import MentorBrowseNGOs from './pages/mentor/BrowseNGOs'
import MentorProfile from './pages/mentor/Profile'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentMyClasses from './pages/student/MyClasses'
import StudentMyMentor from './pages/student/MyMentor'
import StudentTests from './pages/student/Tests'
import StudentTakeTest from './pages/student/TakeTest'
import StudentProgress from './pages/student/Progress'
import StudentScorecard from './pages/student/Scorecard'

// Public Test Page
import PublicTest from './pages/test/PublicTest'

// Placeholder dashboard pages
const DashboardPlaceholder = ({ role }) => (
  <div className="card text-center">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">
      {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
    </h1>
    <p className="text-gray-600 mb-4">Welcome to your dashboard. This is a placeholder for the {role} dashboard page.</p>
    <p className="text-sm text-gray-500">
      Replace this component with actual dashboard content from pages/dashboard/{role}/
    </p>
  </div>
)

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-2">Page not found</p>
      <p className="text-sm text-gray-400 mb-6 italic">Path: {window.location.pathname}</p>
      <a href="/" className="btn-primary inline-flex">
        Go to Home
      </a>
    </div>
  </div>
)

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading..." />
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Public Test Taking */}
        <Route path="/test" element={<PublicTest />} />
        <Route path="/test/:testId" element={<PublicTest />} />

        {/* NGO Admin Routes */}
        <Route
          path="/ngo_admin/*"
          element={
            <ProtectedRoute requiredRole="ngo_admin">
              <Routes>
                <Route path="dashboard" element={<NGODashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="students/:studentId" element={<StudentDetail />} />
                <Route path="volunteers" element={<Volunteers />} />
                <Route path="mentors" element={<Mentors />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/ngo_admin/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Volunteer Routes */}
        <Route
          path="/volunteer/*"
          element={
            <ProtectedRoute requiredRole="volunteer">
              <Routes>
                <Route path="dashboard" element={<DashboardPlaceholder role="volunteer" />} />
                <Route path="sessions" element={<DashboardPlaceholder role="volunteer-sessions" />} />
                <Route path="learning-path" element={<DashboardPlaceholder role="volunteer-learning" />} />
                <Route path="students" element={<DashboardPlaceholder role="volunteer-students" />} />
                <Route path="test-results" element={<DashboardPlaceholder role="volunteer-tests" />} />
                <Route path="*" element={<Navigate to="/volunteer/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Mentor Routes */}
        <Route
          path="/mentor/*"
          element={
            <ProtectedRoute requiredRole="mentor">
              <Routes>
                <Route path="dashboard" element={<MentorDashboard />} />
                <Route path="students" element={<MentorMyStudents />} />
                <Route path="student/:studentId/progress" element={<MentorStudentProgress />} />
                <Route path="alerts" element={<MentorAlerts />} />
                <Route path="schedule" element={<MentorSchedule />} />
                <Route path="browse-ngos" element={<MentorBrowseNGOs />} />
                <Route path="profile" element={<MentorProfile />} />
                <Route path="*" element={<Navigate to="/mentor/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute requiredRole="student">
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="classes" element={<StudentMyClasses />} />
                <Route path="tests" element={<StudentTests />} />
                <Route path="tests/:testId/take" element={<StudentTakeTest />} />
                <Route path="progress" element={<StudentProgress />} />
                <Route path="mentor" element={<StudentMyMentor />} />
                <Route path="scorecard/:testId" element={<StudentScorecard />} />
                <Route path="badges" element={<DashboardPlaceholder role="student-badges" />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Common Routes */}
        <Route path="/profile" element={<DashboardPlaceholder role="profile" />} />
        <Route path="/settings" element={<DashboardPlaceholder role="settings" />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
