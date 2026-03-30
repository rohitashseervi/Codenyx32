import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Save, Mail, Phone, MapPin } from 'lucide-react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const { profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    expertSubjects: [],
    languagesSpoken: [],
    behaviors: {
      losingInterest: '',
      scaredToAsk: '',
      learningDifficulties: '',
      buildingTrust: '',
      explainConcept: '',
    },
  })

  const allSubjects = ['Math', 'English', 'Science', 'Social Studies', 'Computer Science']
  const allLanguages = ['English', 'Hindi', 'Spanish', 'French', 'Mandarin']

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        expertSubjects: profile.expertSubjects || [],
        languagesSpoken: profile.languagesSpoken || [],
        behaviors: profile.behaviors || {
          losingInterest: '',
          scaredToAsk: '',
          learningDifficulties: '',
          buildingTrust: '',
          explainConcept: '',
        },
      })
      setLoading(false)
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBehaviorChange = (key, value) => {
    setProfileData((prev) => ({
      ...prev,
      behaviors: { ...prev.behaviors, [key]: value },
    }))
  }

  const toggleSubject = (subject) => {
    setProfileData((prev) => ({
      ...prev,
      expertSubjects: prev.expertSubjects.includes(subject)
        ? prev.expertSubjects.filter((s) => s !== subject)
        : prev.expertSubjects.length < 2
          ? [...prev.expertSubjects, subject]
          : prev.expertSubjects,
    }))
  }

  const toggleLanguage = (language) => {
    setProfileData((prev) => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter((l) => l !== language)
        : [...prev.languagesSpoken, language],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.mentor.updateProfile(profileData)
      await refreshProfile()
      toast.success('Profile updated successfully!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading profile..." />

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Update your information and expertise</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="input-field"
                disabled
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                className="input-field"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                City
              </label>
              <input
                type="text"
                name="city"
                value={profileData.city}
                onChange={handleInputChange}
                placeholder="New York"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Expertise */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Expertise</h2>

          {/* Expert Subjects */}
          <div className="mb-6">
            <label className="label">
              Expert Subjects <span className="text-danger-600">*</span> (Select up to 2)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors border-2 ${
                    profileData.expertSubjects.includes(subject)
                      ? 'bg-primary-100 border-primary-600 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            {profileData.expertSubjects.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {profileData.expertSubjects.join(', ')}
              </p>
            )}
          </div>

          {/* Languages */}
          <div>
            <label className="label">Languages Spoken</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allLanguages.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors border-2 ${
                    profileData.languagesSpoken.includes(language)
                      ? 'bg-secondary-100 border-secondary-600 text-secondary-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Behavioral Questions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Teaching Philosophy</h2>
          <div className="space-y-5">
            {/* Question 1 */}
            <div>
              <label className="label font-medium text-gray-900">
                How would you handle a child who is consistently losing interest?
              </label>
              <textarea
                value={profileData.behaviors.losingInterest}
                onChange={(e) => handleBehaviorChange('losingInterest', e.target.value)}
                placeholder="Share your approach..."
                className="input-field resize-none"
                rows="3"
              />
            </div>

            {/* Question 2 */}
            <div>
              <label className="label font-medium text-gray-900">
                A student is scared to ask questions. What do you do?
              </label>
              <textarea
                value={profileData.behaviors.scaredToAsk}
                onChange={(e) => handleBehaviorChange('scaredToAsk', e.target.value)}
                placeholder="Share your approach..."
                className="input-field resize-none"
                rows="3"
              />
            </div>

            {/* Question 3 */}
            <div>
              <label className="label font-medium text-gray-900">
                How comfortable are you with children who have learning difficulties?
              </label>
              <textarea
                value={profileData.behaviors.learningDifficulties}
                onChange={(e) => handleBehaviorChange('learningDifficulties', e.target.value)}
                placeholder="Share your experience..."
                className="input-field resize-none"
                rows="3"
              />
            </div>

            {/* Question 4 */}
            <div>
              <label className="label font-medium text-gray-900">
                Describe your approach to building trust with a child.
              </label>
              <textarea
                value={profileData.behaviors.buildingTrust}
                onChange={(e) => handleBehaviorChange('buildingTrust', e.target.value)}
                placeholder="Share your strategy..."
                className="input-field resize-none"
                rows="3"
              />
            </div>

            {/* Question 5 */}
            <div>
              <label className="label font-medium text-gray-900">
                How do you explain a concept that a child doesn't understand after multiple attempts?
              </label>
              <textarea
                value={profileData.behaviors.explainConcept}
                onChange={(e) => handleBehaviorChange('explainConcept', e.target.value)}
                placeholder="Share your technique..."
                className="input-field resize-none"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile
