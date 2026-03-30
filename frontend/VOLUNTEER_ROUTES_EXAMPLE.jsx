/**
 * Example Route Configuration for Volunteer Pages
 * Add these routes to your main router configuration
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Import all volunteer pages
import {
  Dashboard,
  Sessions,
  LearningPath,
  CreateTest,
  TestResults,
  MyStudents,
  BrowseNGOs,
  Profile,
} from './pages/volunteer'

// Import protected route component
import ProtectedRoute from './components/common/ProtectedRoute'

/**
 * OPTION 1: Inline Route Configuration
 * Add these routes directly in your main App.jsx
 */
export const volunteerRoutes = (
  <>
    {/* Main volunteer dashboard */}
    <Route
      path="volunteer"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* Alias for dashboard */}
    <Route
      path="volunteer/dashboard"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* Sessions management */}
    <Route
      path="volunteer/sessions"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <Sessions />
        </ProtectedRoute>
      }
    />

    {/* Learning path visualization */}
    <Route
      path="volunteer/learning-path"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <LearningPath />
        </ProtectedRoute>
      }
    />

    {/* Test creation */}
    <Route
      path="volunteer/create-test"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <CreateTest />
        </ProtectedRoute>
      }
    />

    {/* Test results and analytics */}
    <Route
      path="volunteer/test-results"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <TestResults />
        </ProtectedRoute>
      }
    />

    {/* Student management */}
    <Route
      path="volunteer/students"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <MyStudents />
        </ProtectedRoute>
      }
    />

    {/* Browse and join NGOs */}
    <Route
      path="volunteer/browse-ngos"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <BrowseNGOs />
        </ProtectedRoute>
      }
    />

    {/* Volunteer profile setup/edit */}
    <Route
      path="volunteer/profile"
      element={
        <ProtectedRoute requiredRole="volunteer">
          <Profile />
        </ProtectedRoute>
      }
    />
  </>
)

/**
 * OPTION 2: Nested Route Configuration
 * Better for organizing multiple volunteer pages
 */
export const volunteerRoutesNested = (
  <Route
    path="volunteer"
    element={
      <ProtectedRoute requiredRole="volunteer">
        <Layout /> {/* Your layout component */}
      </ProtectedRoute>
    }
  >
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="sessions" element={<Sessions />} />
    <Route path="learning-path" element={<LearningPath />} />
    <Route path="create-test" element={<CreateTest />} />
    <Route path="test-results" element={<TestResults />} />
    <Route path="students" element={<MyStudents />} />
    <Route path="browse-ngos" element={<BrowseNGOs />} />
    <Route path="profile" element={<Profile />} />
  </Route>
)

/**
 * OPTION 3: Route Configuration Object
 * Useful for route-based code splitting and dynamic loading
 */
export const volunteerRoutesConfig = [
  {
    path: '/volunteer',
    component: Dashboard,
    exact: true,
    label: 'Dashboard',
    icon: 'Home',
    protected: true,
    requiredRole: 'volunteer',
  },
  {
    path: '/volunteer/sessions',
    component: Sessions,
    label: 'Sessions',
    icon: 'Calendar',
    protected: true,
    requiredRole: 'volunteer',
  },
  {
    path: '/volunteer/learning-path',
    component: LearningPath,
    label: 'Learning Path',
    icon: 'Map',
    protected: true,
    requiredRole: 'volunteer',
  },
  {
    path: '/volunteer/create-test',
    component: CreateTest,
    label: 'Create Test',
    icon: 'Plus',
    protected: true,
    requiredRole: 'volunteer',
    hideFromNav: true, // Usually accessed from sessions, not directly
  },
  {
    path: '/volunteer/test-results',
    component: TestResults,
    label: 'Test Results',
    icon: 'BarChart',
    protected: true,
    requiredRole: 'volunteer',
  },
  {
    path: '/volunteer/students',
    component: MyStudents,
    label: 'My Students',
    icon: 'Users',
    protected: true,
    requiredRole: 'volunteer',
  },
  {
    path: '/volunteer/browse-ngos',
    component: BrowseNGOs,
    label: 'Browse NGOs',
    icon: 'Search',
    protected: true,
    requiredRole: 'volunteer',
  },
  {
    path: '/volunteer/profile',
    component: Profile,
    label: 'Profile',
    icon: 'User',
    protected: true,
    requiredRole: 'volunteer',
  },
]

/**
 * Example sidebar navigation configuration
 * Use with volunteer routes config above
 */
export const volunteerNavigation = volunteerRoutesConfig.filter(
  (route) => !route.hideFromNav
)

/**
 * Helper function to create dynamic routes from config
 * Usage: createRoutesFromConfig(volunteerRoutesConfig)
 */
export function createRoutesFromConfig(routesConfig) {
  return routesConfig.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        route.protected ? (
          <ProtectedRoute requiredRole={route.requiredRole}>
            <route.component />
          </ProtectedRoute>
        ) : (
          <route.component />
        )
      }
    />
  ))
}

/**
 * Example complete App.jsx setup
 */
export const exampleAppSetup = `
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Providers
import { AuthProvider } from './context/AuthContext'

// Layout
import Layout from './components/common/Layout'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Volunteer routes
import {
  Dashboard,
  Sessions,
  LearningPath,
  CreateTest,
  TestResults,
  MyStudents,
  BrowseNGOs,
  Profile,
} from './pages/volunteer'

// ProtectedRoute component
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Volunteer Routes */}
          <Route
            path="volunteer"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/dashboard"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/sessions"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <Sessions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/learning-path"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <LearningPath />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/create-test"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <CreateTest />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/test-results"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <TestResults />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/students"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <MyStudents />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/browse-ngos"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <BrowseNGOs />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="volunteer/profile"
            element={
              <ProtectedRoute requiredRole="volunteer">
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
`

/**
 * Navigation links for sidebar/navbar
 * Use this in your Layout or Navbar component
 */
export const getVolunteerNavItems = () => [
  {
    label: 'Dashboard',
    path: '/volunteer',
    icon: 'Home',
  },
  {
    label: 'Sessions',
    path: '/volunteer/sessions',
    icon: 'Calendar',
  },
  {
    label: 'Learning Path',
    path: '/volunteer/learning-path',
    icon: 'Map',
  },
  {
    label: 'Test Results',
    path: '/volunteer/test-results',
    icon: 'BarChart',
  },
  {
    label: 'My Students',
    path: '/volunteer/students',
    icon: 'Users',
  },
  {
    label: 'Browse NGOs',
    path: '/volunteer/browse-ngos',
    icon: 'Search',
  },
  {
    label: 'Profile',
    path: '/volunteer/profile',
    icon: 'User',
  },
]

export default {
  volunteerRoutes,
  volunteerRoutesNested,
  volunteerRoutesConfig,
  volunteerNavigation,
  createRoutesFromConfig,
  getVolunteerNavItems,
}
