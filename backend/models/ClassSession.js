const mongoose = require('mongoose');

const ClassSessionSchema = new mongoose.Schema({
  classGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  },
  topic: String,
  subject: String,
  grade: String,
  scheduledDate: Date,
  duration: Number,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetLink: String,
  meetEventId: String,
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  },
  startedAt: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
