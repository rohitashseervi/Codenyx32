import React from 'react'

const MasteryMap = ({ topics = [] }) => {
  // Map mastery levels to colors
  const getMasteryColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'mastered':
        return 'bg-success-500'
      case 'proficient':
        return 'bg-success-400'
      case 'learning':
        return 'bg-yellow-400'
      case 'not-started':
      default:
        return 'bg-gray-300'
    }
  }

  const getLevelLabel = (level) => {
    switch (level?.toLowerCase()) {
      case 'mastered':
        return 'Mastered'
      case 'proficient':
        return 'Proficient'
      case 'learning':
        return 'Learning'
      case 'not-started':
      default:
        return 'Not Started'
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Mastery Map</h3>

      {topics.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No topics to display</p>
      ) : (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {topics.map((topic, index) => (
              <div key={index} className="group cursor-pointer">
                <div
                  className={`${getMasteryColor(topic.level)} rounded-lg h-24 flex items-center justify-center shadow-md transition-all group-hover:shadow-lg`}
                  title={`${topic.name}: ${getLevelLabel(topic.level)}`}
                >
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white px-2">{topic.name}</p>
                    <p className="text-xs text-white/80 mt-1">{topic.percentage || 0}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success-500 rounded"></div>
              <span className="text-xs text-gray-700">Mastered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success-400 rounded"></div>
              <span className="text-xs text-gray-700">Proficient</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-xs text-gray-700">Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-xs text-gray-700">Not Started</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MasteryMap
