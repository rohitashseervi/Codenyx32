import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

// NGO Pages
import NGODashboard from './pages/ngo/Dashboard'
import Students from './pages/ngo/Students'
import StudentDetail from './pages/ngo/StudentDetail'
import EnrollStudent from './pages/ngo/EnrollStudent'
import Volunteers from './pages/ngo/Volunteers'
import Mentors from './pages/ngo/Mentors'
import Reports from './pages/ngo/Reports'
import Settings from './pages/ngo/Settings'

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/Dashboard'
import VolunteerSessions from './pages/volunteer/Sessions'
import VolunteerLearningPath from './pages/volunteer/LearningPath'
import VolunteerCreateTest from './pages/volunteer/CreateTest'
import VolunteerTestResults from './pages/volunteer/TestResults'
import VolunteerMyStudents from './pages/volunteer/MyStudents'
import VolunteerBrowseNGOs from './pages/volunteer/BrowseNGOs'
import VolunteerProfile from './pages/volunteer/Profile'

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

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">Page not found</p>
      <a href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
        Go Home
      </a>
    </div>
  </div>
)

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading GapZero..." />
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

        {/* Public Test Taking (accessed via Gmail link with Test ID) */}
        <Route path="/test" element={<PublicTest />} />
        <Route path="/test/:testId" element={<PublicTest />} />

        {/* ==================== NGO Admin Routes ==================== */}
        <Route
          path="/ngo/*"
          element={
            <ProtectedRoute requiredRole="ngo">
              <Routes>
                <Route path="dashboard" element={<NGODashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="students/enroll" element={<EnrollStudent />} />
                <Route path="students/:studentId" element={<StudentDetail />} />
                <Route path="volunteers" element={<Volunteers />} />
                <Route path="mentors" element={<Mentors />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/ngo/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* ==================== Volunteer Routes ==================== */}
        <Route
          path="/volunteer/*"
          element={
            <ProtectedRoute requiredRole="volunteer">
              <Routes>
                <Route path="dashboard" element={<VolunteerDashboard />} />
                <Route path="sessions" element={<VolunteerSessions />} />
                <Route path="learning-path" element={<VolunteerLearningPath />} />
                <Route path="create-test" element={<VolunteerCreateTest />} />
                <Route path="create-test/:sessionId" element={<VolunteerCreateTest />} />
                <Route path="test-results" element={<VolunteerTestResults />} />
                <Route path="test-results/:assessmentId" element={<VolunteerTestResults />} />
                <Route path="students" element={<VolunteerMyStudents />} />
                <Route path="browse-ngos" element={<VolunteerBrowseNGOs />} />
                <Route path="profile" element={<VolunteerProfile />} />
                <Route path="*" element={<Navigate to="/volunteer/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* ==================== Mentor Routes ==================== */}
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

        {/* ==================== Student Routes ==================== */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute requiredRole="student">
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="classes" element={<StudentMyClasses />} />
                <Route path="mentor" element={<StudentMyMentor />} />
                <Route path="tests" element={<StudentTests />} />
                <Route path="tests/:testId/take" element={<StudentTakeTest />} />
                <Route path="progress" element={<StudentProgress />} />
                <Route path="scorecard/:testId" element={<StudentScorecard />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
