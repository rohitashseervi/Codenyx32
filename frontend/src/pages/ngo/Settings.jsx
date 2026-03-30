import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Save, Plus, Trash2, Bell, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Settings = () => {
  const { profile } = useAuth()
  const ngoId = profile?.ngoId
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  const [ngoProfile, setNgoProfile] = useState({
    name: '',
    description: '',
    mission: '',
    region: '',
    grades: [],
    subjects: [],
    languages: [],
  })

  const [classGroups, setClassGroups] = useState([])
  const [newGroupName, setNewGroupName] = useState('')

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailOnStudentEnrollment: true,
    emailOnVolunteerApplication: true,
    emailOnMentorApplication: true,
    emailOnAtRiskStudent: true,
    emailWeeklySummary: false,
  })

  const [thresholds, setThresholds] = useState({
    atRiskMasteryScore: 60,
    atRiskSessionMissed: 2,
    excellentMasteryScore: 85,
  })

  useEffect(() => {
    if (!ngoId) return

    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock settings data
        setNgoProfile({
          name: profile?.ngoName || 'GapZero Education',
          description: 'Empowering students through quality education and mentorship',
          mission: 'To bridge the gap in quality education and create equal learning opportunities for all',
          region: 'North India',
          grades: [1, 2, 3, 4, 5],
          subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
          languages: ['English', 'Hindi'],
        })

        setClassGroups([
          { id: 1, name: 'Grade 1-A', students: 25 },
          { id: 2, name: 'Grade 2-B', students: 28 },
          { id: 3, name: 'Grade 3-C', students: 30 },
        ])

        setNotificationPreferences({
          emailOnStudentEnrollment: true,
          emailOnVolunteerApplication: true,
          emailOnMentorApplication: true,
          emailOnAtRiskStudent: true,
          emailWeeklySummary: false,
        })

        setThresholds({
          atRiskMasteryScore: 60,
          atRiskSessionMissed: 2,
          excellentMasteryScore: 85,
        })
      } catch (err) {
        console.error('Failed to fetch settings:', err)
        setError('Failed to load settings. Please try again.')
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [ngoId, profile])

  const handleProfileChange = (field, value) => {
    setNgoProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMultiSelectChange = (field, values) => {
    setNgoProfile((prev) => ({
      ...prev,
      [field]: values,
    }))
  }

  const handleAddClassGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    try {
      const newGroup = {
        id: classGroups.length + 1,
        name: newGroupName,
        students: 0,
      }
      setClassGroups((prev) => [...prev, newGroup])
      setNewGroupName('')
      toast.success('Class group created!')
    } catch (err) {
      console.error('Failed to create class group:', err)
      toast.error('Failed to create class group')
    }
  }

  const handleDeleteClassGroup = (groupId) => {
    setClassGroups((prev) => prev.filter((g) => g.id !== groupId))
    toast.success('Class group deleted')
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      await api.ngo.update(ngoId, ngoProfile)
      toast.success('NGO profile updated successfully!')
    } catch (err) {
      console.error('Failed to save profile:', err)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      // In a real app, save to backend
      toast.success('Notification preferences updated!')
    } catch (err) {
      console.error('Failed to save preferences:', err)
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveThresholds = async () => {
    try {
      setSaving(true)
      // In a real app, save to backend
      toast.success('Performance thresholds updated!')
    } catch (err) {
      console.error('Failed to save thresholds:', err)
      toast.error('Failed to save thresholds')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your NGO profile and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            NGO Profile
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Class Groups
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('thresholds')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'thresholds'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Performance Thresholds</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">NGO Profile</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NGO Name</label>
                <input
                  type="text"
                  value={ngoProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={ngoProfile.description}
                  onChange={(e) => handleProfileChange('description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
                <textarea
                  value={ngoProfile.mission}
                  onChange={(e) => handleProfileChange('mission', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={ngoProfile.region}
                  onChange={(e) => handleProfileChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Region</option>
                  <option value="North India">North India</option>
                  <option value="South India">South India</option>
                  <option value="East India">East India</option>
                  <option value="West India">West India</option>
                  <option value="Central India">Central India</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grades Served</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <label key={grade} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ngoProfile.grades.includes(grade)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleMultiSelectChange('grades', [...ngoProfile.grades, grade])
                          } else {
                            handleMultiSelectChange(
                              'grades',
                              ngoProfile.grades.filter((g) => g !== grade)
                            )
                          }
                        }}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">Grade {grade}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Taught</label>
                <div className="space-y-2">
                  {['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi'].map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ngoProfile.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleMultiSelectChange('subjects', [...ngoProfile.subjects, subject])
                          } else {
                            handleMultiSelectChange(
                              'subjects',
                              ngoProfile.subjects.filter((s) => s !== subject)
                            )
                          }
                        }}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="space-y-2">
                  {['English', 'Hindi', 'Other'].map((lang) => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ngoProfile.languages.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleMultiSelectChange('languages', [...ngoProfile.languages, lang])
                          } else {
                            handleMultiSelectChange(
                              'languages',
                              ngoProfile.languages.filter((l) => l !== lang)
                            )
                          }
                        }}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Class Groups Tab */}
        {activeTab === 'groups' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Class Groups</h2>

            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter group name (e.g., Grade 1-A)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddClassGroup}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Group</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {classGroups && classGroups.length > 0 ? (
                classGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{group.name}</p>
                      <p className="text-sm text-gray-600">{group.students} students</p>
                    </div>
                    <button
                      onClick={() => handleDeleteClassGroup(group.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No class groups yet. Create one to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

            <div className="space-y-4">
              <NotificationCheckbox
                label="Email on Student Enrollment"
                description="Get notified when a new student enrolls"
                checked={notificationPreferences.emailOnStudentEnrollment}
                onChange={(value) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailOnStudentEnrollment: value,
                  }))
                }
              />

              <NotificationCheckbox
                label="Email on Volunteer Application"
                description="Get notified when a volunteer applies"
                checked={notificationPreferences.emailOnVolunteerApplication}
                onChange={(value) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailOnVolunteerApplication: value,
                  }))
                }
              />

              <NotificationCheckbox
                label="Email on Mentor Application"
                description="Get notified when a mentor applies"
                checked={notificationPreferences.emailOnMentorApplication}
                onChange={(value) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailOnMentorApplication: value,
                  }))
                }
              />

              <NotificationCheckbox
                label="Email on At-Risk Student"
                description="Get notified when a student is flagged as at-risk"
                checked={notificationPreferences.emailOnAtRiskStudent}
                onChange={(value) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailOnAtRiskStudent: value,
                  }))
                }
              />

              <NotificationCheckbox
                label="Weekly Summary Email"
                description="Receive a weekly summary of NGO activities"
                checked={notificationPreferences.emailWeeklySummary}
                onChange={(value) =>
                  setNotificationPreferences((prev) => ({
                    ...prev,
                    emailWeeklySummary: value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Performance Thresholds Tab */}
        {activeTab === 'thresholds' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Thresholds</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  At-Risk Mastery Score Threshold
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thresholds.atRiskMasteryScore}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        atRiskMasteryScore: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-gray-900 min-w-fit">
                    {thresholds.atRiskMasteryScore}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Students with mastery score below this will be flagged as at-risk
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  At-Risk Consecutive Missed Sessions
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={thresholds.atRiskSessionMissed}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        atRiskSessionMissed: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-gray-900 min-w-fit">
                    {thresholds.atRiskSessionMissed}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Students missing this many consecutive sessions will be flagged
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excellent Mastery Score Threshold
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={thresholds.excellentMasteryScore}
                    onChange={(e) =>
                      setThresholds((prev) => ({
                        ...prev,
                        excellentMasteryScore: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-gray-900 min-w-fit">
                    {thresholds.excellentMasteryScore}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Students with mastery score at or above this will be considered excellent
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleSaveThresholds}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Thresholds'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Notification Checkbox Component
const NotificationCheckbox = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 mt-1 text-primary-600 rounded"
      />
      <div className="ml-3">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

export default Settings
