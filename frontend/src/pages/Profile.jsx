import React from 'react'
import { User, Mail, Shield, Bell, Lock, Globe, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, role, profile } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.displayName || 'User Name'}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {role?.replace('_', ' ')}
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
              </div>
            </div>
            
            <button className="btn-primary">Edit Profile</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
            {/* Account Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-gray-500">Full Name</span>
                  <span className="text-sm font-medium text-gray-900 col-span-2">{user?.displayName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-gray-500">Email Address</span>
                  <span className="text-sm font-medium text-gray-900 col-span-2">{user?.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="text-sm font-medium text-gray-900 col-span-2 capitalize">{role?.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-gray-900 col-span-2">March 2024</span>
                </div>
              </div>
            </div>

            {/* Profile Data */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-secondary-600" />
                Dashboard Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                  </div>
                  <div className="w-10 h-5 bg-primary-600 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Two-Factor Auth</span>
                  </div>
                  <div className="w-10 h-5 bg-gray-300 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Public Profile</span>
                  </div>
                  <div className="w-10 h-5 bg-primary-600 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
