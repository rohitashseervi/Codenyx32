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
  subject: String,
  grade: String,
  commitmentDuration: Number,
  timeSlots: [{
    dayOfWeek: String,
    startTime: String,
    endTime: String,
    duration: Number
  }],
  startDate: Date,
  endDate: Date,
  modules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule'
    },
    moduleName: String,
    moduleDuration: Number,
    scheduledDate: Date,
    status: String,
    completedDate: Date
  }],
  totalModules: Number,
  completedModules: {
    type: Number,
    default: 0
  },
  status: String,
  createdAt: Date
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
