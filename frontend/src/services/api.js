import axios from 'axios'
import { auth } from '../config/firebase'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach Firebase token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.statusText || 'An error occurred'

      if (error.response.status === 401) {
        // Unauthorized - might need to logout
        console.error('Unauthorized access')
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action')
      } else if (error.response.status === 404) {
        // Not found - don't toast as it might be expected
      } else if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.')
      }
    } else if (error.request) {
      console.error('No response received:', error.request)
      toast.error('Network error. Please check your connection.')
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getMe: () => axiosInstance.get('/auth/me'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
}

// NGO endpoints
const ngoAPI = {
  create: (data) => axiosInstance.post('/ngo_admin/register', data),
  get: (ngoId) => axiosInstance.get(`/ngo_admin/${ngoId}`),
  update: (ngoId, data) => axiosInstance.put(`/ngo_admin/${ngoId}`, data),
  list: (params) => axiosInstance.get('/ngo_admin', { params }),
  getDashboard: (ngoId) => axiosInstance.get(`/ngo_admin/${ngoId}/dashboard`),
  getStudents: (ngoId, params) => axiosInstance.get(`/ngo_admin/${ngoId}/students`, { params }),
  getVolunteers: (ngoId, params) => axiosInstance.get(`/ngo_admin/${ngoId}/volunteers`, { params }),
  getMentors: (ngoId, params) => axiosInstance.get(`/ngo_admin/${ngoId}/mentors`, { params }),
  enrollStudent: (ngoId, data) => axiosInstance.post(`/ngo_admin/${ngoId}/students/enroll`, data),
  bulkEnroll: (ngoId, data) => axiosInstance.post(`/ngo_admin/${ngoId}/students/bulk-enroll`, data),
  approve: (ngoId, userId) => axiosInstance.post(`/ngo_admin/${ngoId}/approve/${userId}`),
  reject: (ngoId, userId) => axiosInstance.post(`/ngo_admin/${ngoId}/reject/${userId}`),
}

// Volunteer endpoints
const volunteerAPI = {
  register: (data) => axiosInstance.post('/volunteer/register', data),
  updateProfile: (data) => axiosInstance.put('/volunteer/profile', data),
  browseNGOs: (params) => axiosInstance.get('/volunteer/ngo_admin/browse', { params }),
  joinNGO: (ngoId) => axiosInstance.post(`/volunteer/ngo_admin/${ngoId}/join`),
  getLearningPath: () => axiosInstance.get('/volunteer/learning-path'),
  getSessions: (params) => axiosInstance.get('/volunteer/sessions', { params }),
  startSession: (sessionId) => axiosInstance.post(`/volunteer/sessions/${sessionId}/start`),
  completeSession: (sessionId, data) => axiosInstance.post(`/volunteer/sessions/${sessionId}/complete`, data),
  createTest: (data) => axiosInstance.post('/volunteer/test/create', data),
  getStudents: (params) => axiosInstance.get('/volunteer/students', { params }),
  getTestResults: (params) => axiosInstance.get('/volunteer/test-results', { params }),
}

// Mentor endpoints
const mentorAPI = {
  register: (data) => axiosInstance.post('/mentor/register', data),
  updateProfile: (data) => axiosInstance.put('/mentor/profile', data),
  browseNGOs: (params) => axiosInstance.get('/mentor/ngo_admin/browse', { params }),
  joinNGO: (ngoId) => axiosInstance.post(`/mentor/ngo_admin/${ngoId}/join`),
  getStudents: (params) => axiosInstance.get('/mentor/students', { params }),
  getStudentProgress: (studentId) => axiosInstance.get(`/mentor/students/${studentId}/progress`),
  scheduleMeet: (data) => axiosInstance.post('/mentor/schedule-meet', data),
  getAlerts: () => axiosInstance.get('/mentor/alerts'),
  addNotes: (studentId, data) => axiosInstance.post(`/mentor/students/${studentId}/notes`, data),
}

// Student endpoints
const studentAPI = {
  getProfile: () => axiosInstance.get('/student/profile'),
  getClasses: (params) => axiosInstance.get('/student/classes', { params }),
  getMentor: () => axiosInstance.get('/student/mentor'),
  requestMentor: (data) => axiosInstance.post('/student/mentor/request', data),
  changeMentor: (mentorId) => axiosInstance.post(`/student/mentor/${mentorId}/change`),
  getTests: (params) => axiosInstance.get('/student/tests', { params }),
  getTest: (testId) => axiosInstance.get(`/student/tests/${testId}`),
  submitTest: (testId, data) => axiosInstance.post(`/student/tests/${testId}/submit`, data),
  getProgress: () => axiosInstance.get('/student/progress'),
  getBadges: () => axiosInstance.get('/student/badges'),
}

// Test endpoints
const testAPI = {
  getByTestId: (testId) => axiosInstance.get(`/test/${testId}`),
  submit: (testId, data) => axiosInstance.post(`/test/${testId}/submit`, data),
  getResults: (testId) => axiosInstance.get(`/test/${testId}/results`),
  getScorecard: (testId) => axiosInstance.get(`/test/${testId}/scorecard`),
}

// Dashboard endpoints
const dashboardAPI = {
  overview: (ngoId) => axiosInstance.get(`/dashboard/${ngoId}/overview`),
  students: (ngoId, params) => axiosInstance.get(`/dashboard/${ngoId}/students`, { params }),
  volunteers: (ngoId, params) => axiosInstance.get(`/dashboard/${ngoId}/volunteers`, { params }),
  mentors: (ngoId, params) => axiosInstance.get(`/dashboard/${ngoId}/mentors`, { params }),
  subjects: (ngoId) => axiosInstance.get(`/dashboard/${ngoId}/subjects`),
  atRisk: (ngoId) => axiosInstance.get(`/dashboard/${ngoId}/at-risk`),
  testResults: (ngoId, params) => axiosInstance.get(`/dashboard/${ngoId}/test-results`, { params }),
  trends: (ngoId, params) => axiosInstance.get(`/dashboard/${ngoId}/trends`, { params }),
}

export const api = {
  auth: authAPI,
  ngo: ngoAPI,
  volunteer: volunteerAPI,
  mentor: mentorAPI,
  student: studentAPI,
  test: testAPI,
  dashboard: dashboardAPI,
}

export default axiosInstance
