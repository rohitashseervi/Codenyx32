import React from 'react'
import { Award } from 'lucide-react'

const Badge = ({ icon: Icon = Award, name, dateEarned, description, color = 'accent' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-700 border-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 border-secondary-300',
    accent: 'bg-accent-100 text-accent-700 border-accent-300',
    success: 'bg-success-100 text-success-700 border-success-300',
    danger: 'bg-danger-100 text-danger-700 border-danger-300',
    ngo: 'bg-ngo-100 text-ngo-700 border-ngo-300',
  }

  const iconColorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    accent: 'text-accent-600',
    success: 'text-success-600',
    danger: 'text-danger-600',
    ngo: 'text-ngo-600',
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className={`border-2 rounded-xl p-4 ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-white`}>
          <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{name}</h3>
          {dateEarned && <p className="text-xs opacity-75">Earned {formatDate(dateEarned)}</p>}
        </div>
      </div>
      {description && <p className="text-xs opacity-75 leading-relaxed">{description}</p>}
    </div>
  )
}

export default Badge
