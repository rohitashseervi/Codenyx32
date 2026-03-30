import React from 'react'
import { Flame } from 'lucide-react'

const StreakCounter = ({ count = 0, goal = 30, message = 'Keep it up!' }) => {
  const percentage = Math.min((count / goal) * 100, 100)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Learning Streak</h3>
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-2xl font-bold text-orange-500">{count}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {count} of {goal} day goal
        </p>
      </div>

      {/* Motivational message */}
      <p className="text-sm text-gray-700 text-center font-medium">{message}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">{count}</p>
          <p className="text-xs text-gray-600">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary-600">{goal}</p>
          <p className="text-xs text-gray-600">Goal</p>
        </div>
      </div>
    </div>
  )
}

export default StreakCounter
