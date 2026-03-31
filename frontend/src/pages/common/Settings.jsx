import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { User, Bell, Shield, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { profile, role } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    sessionReminders: true,
    progressUpdates: true,
    weeklyReport: false,
  })

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success('Notification preference updated')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                defaultValue={profile?.name || profile?.displayName || ''}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue={profile?.email || ''}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={role === 'ngo_admin' ? 'NGO Admin' : (role || '').charAt(0).toUpperCase() + (role || '').slice(1)}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => toast.success('Profile updated successfully')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-sm text-gray-600">
                  {key === 'emailAlerts' && 'Receive email notifications for important updates'}
                  {key === 'sessionReminders' && 'Get reminded before scheduled sessions'}
                  {key === 'progressUpdates' && 'Notifications about student progress changes'}
                  {key === 'weeklyReport' && 'Weekly summary of activity and progress'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">Change Password</h3>
              <p className="text-sm text-gray-600 mb-3">Update your account password</p>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Change Password
              </button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">Profile Visibility</h3>
              <p className="text-sm text-gray-600 mb-3">Control who can see your profile details</p>
              <select className="p-2 border border-gray-300 rounded-lg">
                <option>Visible to my NGO</option>
                <option>Visible to everyone</option>
                <option>Private</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">Language</h3>
              <select className="p-2 border border-gray-300 rounded-lg">
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Telugu</option>
                <option>Kannada</option>
              </select>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">Theme</h3>
              <p className="text-sm text-gray-600 mb-3">Coming soon - dark mode and custom themes</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border-2 border-blue-500 text-gray-900 rounded-lg font-medium">Light</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed">Dark</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
