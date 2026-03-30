import React, { useState, useEffect } from 'react'
import { Award, Star, Shield, Zap, Target, BookOpen, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

const Badges = () => {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      setLoading(true)
      const response = await api.student.getBadges()
      setBadges(response.data.badges || [])
    } catch (error) {
      console.error('Failed to fetch badges:', error)
      toast.error('Failed to load badges')
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'zap': return Zap
      case 'star': return Star
      case 'award': return Award
      case 'shield': return Shield
      case 'bookopen': return BookOpen
      case 'target': return Target
      default: return Award
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Achievements</h1>
          <p className="text-gray-600">Track your progress and earn badges as you learn.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg text-primary-700 font-semibold">
          <Award className="w-5 h-5" />
          <span>3 / {badges.length} Earned</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const Icon = getBadgeIcon(badge.icon)
          const isEarned = !!badge.earnedAt
          
          return (
            <div
              key={badge.id || badge._id}
              className={`relative overflow-hidden bg-white rounded-2xl border-2 transition-all p-6 ${
                isEarned ? 'border-primary-100 shadow-md' : 'border-gray-100 grayscale opacity-60'
              }`}
            >
              {!isEarned && (
                <div className="absolute top-3 right-3 text-gray-400">
                  <Shield className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${isEarned ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">{badge.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {badge.description || 'Achievement unlocked through consistent learning.'}
                  </p>
                  {isEarned && (
                    <p className="text-xs font-medium text-primary-600 mt-2">
                      Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              {isEarned && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-wider">
                    Unlocked
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Badges
