import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Users, ChevronDown, ChevronUp, TrendingUp, Award, BookOpen } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const MyStudents = () => {
  const [classGroups, setClassGroups] = useState([])
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [studentProgress, setStudentProgress] = useState({})

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await api.volunteer.getStudents()
      const raw = response.data?.data || response.data?.students || []
      const data = Array.isArray(raw) ? raw : []

      // Group students by class
      const grouped = data.reduce((acc, student) => {
        const groupName = student.classGroup || 'Unassigned'
        if (!acc[groupName]) {
          acc[groupName] = {
            name: groupName,
            grade: student.grade || 'N/A',
            subject: student.subject || 'N/A',
            schedule: student.schedule || 'TBD',
            students: [],
          }
        }
        acc[groupName].students.push(student)
        return acc
      }, {})

      setClassGroups(Object.values(grouped))
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleExpandGroup = async (groupName) => {
    if (expandedGroup === groupName) {
      setExpandedGroup(null)
    } else {
      setExpandedGroup(groupName)
      // Fetch progress for all students in group if not already loaded
      const group = classGroups.find((g) => g.name === groupName)
      if (group) {
        group.students.forEach((student) => {
          if (!studentProgress[student._id || student.id]) {
            fetchStudentProgress(student._id || student.id)
          }
        })
      }
    }
  }

  const fetchStudentProgress = async (studentId) => {
    try {
      // Mock progress data - replace with actual API when available
      setStudentProgress((prev) => ({
        ...prev,
        [studentId]: {
          masteryLevel: ['Beginner', 'Developing', 'Proficient', 'Expert'][
            Math.floor(Math.random() * 4)
          ],
          testsCompleted: Math.floor(Math.random() * 5) + 1,
          averageScore: Math.floor(Math.random() * 40) + 60,
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      }))
    } catch (error) {
      console.error('Failed to fetch student progress:', error)
    }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
  }

  const getMasteryColor = (level) => {
    const colors = {
      Expert: 'bg-green-100 text-green-800',
      Proficient: 'bg-blue-100 text-blue-800',
      Developing: 'bg-yellow-100 text-yellow-800',
      Beginner: 'bg-red-100 text-red-800',
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600 mt-1">
          Manage and track your class groups and student progress
        </p>
      </div>

      {/* Class Groups */}
      {classGroups.length > 0 ? (
        <div className="space-y-4">
          {classGroups.map((group) => (
            <div key={group.name} className="card overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => handleExpandGroup(group.name)}
                className="w-full hover:bg-gray-50 transition-colors p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      <span>Grade: {group.grade}</span>
                      <span>•</span>
                      <span>Subject: {group.subject}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-900">
                        {group.students.length} students
                      </span>
                    </div>
                  </div>
                </div>
                {expandedGroup === group.name ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Expanded Student List */}
              {expandedGroup === group.name && (
                <div className="border-t border-gray-200 divide-y divide-gray-200">
                  {group.students.length > 0 ? (
                    group.students.map((student) => {
                      const progress = studentProgress[student._id || student.id] || {}
                      const timeSinceActive = progress.lastActive
                        ? Math.floor(
                            (Date.now() - progress.lastActive.getTime()) /
                            (1000 * 60 * 60 * 24)
                          )
                        : null

                      return (
                        <div
                          key={student._id || student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {student.name || 'Unnamed Student'}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm">
                              {progress.masteryLevel && (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(progress.masteryLevel)}`}
                                >
                                  {progress.masteryLevel}
                                </span>
                              )}
                              {progress.testsCompleted !== undefined && (
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Award className="w-4 h-4" />
                                  {progress.testsCompleted} tests completed
                                </span>
                              )}
                              {progress.averageScore !== undefined && (
                                <span className="text-gray-600 flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {progress.averageScore}% avg
                                </span>
                              )}
                              {timeSinceActive !== null && (
                                <span className="text-gray-500">
                                  Last active {timeSinceActive}d ago
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectStudent(student)
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View →
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      No students in this group yet
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No student groups available</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedStudent.name || 'Student Details'}
              </h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedStudent.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedStudent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-medium text-gray-900">{selectedStudent.classGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-medium text-gray-900">{selectedStudent.grade || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              {studentProgress[selectedStudent._id || selectedStudent.id] && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Learning Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Mastery Level</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getMasteryColor(
                          studentProgress[selectedStudent._id || selectedStudent.id]
                            .masteryLevel
                        )}`}
                      >
                        {
                          studentProgress[selectedStudent._id || selectedStudent.id]
                            .masteryLevel
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tests Completed</span>
                      <span className="font-medium text-gray-900">
                        {
                          studentProgress[selectedStudent._id || selectedStudent.id]
                            .testsCompleted
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Average Score</span>
                      <span className="font-medium text-gray-900">
                        {
                          studentProgress[selectedStudent._id || selectedStudent.id]
                            .averageScore
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="btn btn-primary flex-1">View Full Profile</button>
                <button className="btn btn-outline flex-1">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyStudents
