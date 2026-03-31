const mongoose = require('mongoose');

const LearningPathSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  },
  classGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  subject: String, // comma-separated: "Math, English"
  grade: String,   // grade group: "1-3" or "4-5"
  commitmentDuration: Number, // weeks
  timeSlots: [{
    dayOfWeek: String,
    startTime: String,
    endTime: String,
    duration: Number
  }],
  startDate: Date,
  endDate: Date,
  modules: [{
    moduleName: String,
    subject: String,
    topic: String,
    description: String,
    week: Number,
    scheduledDate: Date,
    status: {
      type: String,
      enum: ['current', 'upcoming', 'completed', 'skipped'],
      default: 'upcoming'
    },
    completedDate: Date,
    sessions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSession'
    }],
    learningOutcomes: [String]
  }],
  totalModules: Number,
  completedModules: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'in_progress', 'completed', 'abandoned'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
