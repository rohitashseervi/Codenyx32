import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ icon: Icon, label, value, trend = null, trendDirection = 'up', color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
    danger: 'bg-danger-50 text-danger-600',
    ngo: 'bg-ngo-50 text-ngo-600',
  }

  const TrendIcon = trendDirection === 'up' ? TrendingUp : TrendingDown
  const trendColor = trendDirection === 'up' ? 'text-success-600' : 'text-danger-600'

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
          {trend !== null && (
            <div className="flex items-center mt-2 text-sm">
              <TrendIcon className={`w-4 h-4 ${trendColor} mr-1`} />
              <span className={trendColor}>{trend}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard
