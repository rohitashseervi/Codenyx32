import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Save, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: [],
    gradeBand: '',
    timeSlots: [],
    commitmentDuration: '3 months',
    autoAssign: false,
  })

  const subjects = ['Math', 'EVS', 'Telugu', 'English', 'Hindi']
  const gradeBands = ['Class 2-3', 'Class 4-5']
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeRanges = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM',
  ]

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        subjects: profile.subjects || [],
        gradeBand: profile.gradeBand || '',
        timeSlots: profile.timeSlots || [],
        commitmentDuration: profile.commitmentDuration || '3 months',
        autoAssign: profile.autoAssign || false,
      })
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubjectToggle = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleTimeSlotToggle = (day, time) => {
    const slotId = `${day}-${time}`
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slotId)
        ? prev.timeSlots.filter((slot) => slot !== slotId)
        : [...prev.timeSlots, slotId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required')
      return
    }

    if (formData.subjects.length < 2) {
      toast.error('Please select at least 2 subjects')
      return
    }

    if (!formData.gradeBand) {
      toast.error('Please select a grade band')
      return
    }

    if (formData.timeSlots.length === 0) {
      toast.error('Please select at least one time slot')
      return
    }

    try {
      setLoading(true)
      await api.volunteer.updateProfile(formData)
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Update your teaching preferences and availability</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subjects (Minimum 2 required)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <label
                key={subject}
                className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subject)}
                  onChange={() => handleSubjectToggle(subject)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="ml-3 font-medium text-gray-900">{subject}</span>
              </label>
            ))}
          </div>
          {formData.subjects.length > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              Selected: {formData.subjects.join(', ')}
            </p>
          )}
        </div>

        {/* Grade Band Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Grade Band</h2>
          <div className="grid grid-cols-2 gap-4">
            {gradeBands.map((band) => (
              <label
                key={band}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.gradeBand === band
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="gradeBand"
                  value={band}
                  checked={formData.gradeBand === band}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="ml-3 font-medium text-gray-900">{band}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability Time Slots */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Availability (Select time slots)
          </h2>

          {daysOfWeek.map((day) => (
            <div key={day} className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {timeRanges.map((time) => {
                  const slotId = `${day}-${time}`
                  const isSelected = formData.timeSlots.includes(slotId)

                  return (
                    <button
                      key={slotId}
                      type="button"
                      onClick={() => handleTimeSlotToggle(day, time)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {formData.timeSlots.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-medium">{formData.timeSlots.length}</span> time slots selected
              </p>
            </div>
          )}
        </div>

        {/* Commitment Duration */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Commitment Duration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['1 month', '2 months', '3 months', '6 months'].map((duration) => (
              <label
                key={duration}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.commitmentDuration === duration
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="commitmentDuration"
                  value={duration}
                  checked={formData.commitmentDuration === duration}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="ml-2 font-medium text-gray-900 capitalize">{duration}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Auto-assign Toggle */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Auto-assign Classes</h2>
              <p className="text-sm text-gray-600 mt-1">
                Allow the system to automatically assign classes based on your availability
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoAssign"
                checked={formData.autoAssign}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, autoAssign: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 flex-1 justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>

        {/* Validation Messages */}
        <div className="space-y-2">
          {formData.subjects.length < 2 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Select at least 2 subjects to continue
              </p>
            </div>
          )}
          {!formData.gradeBand && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Select a grade band</p>
            </div>
          )}
          {formData.timeSlots.length === 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Select at least one time slot for availability
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default Profile
