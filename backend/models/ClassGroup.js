const mongoose = require('mongoose');

const ClassGroupSchema = new mongoose.Schema({
  name: String,
  subject: String,
  grade: String,
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  schedule: [{
    dayOfWeek: String,
    startTime: String,
    endTime: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClassGroup', ClassGroupSchema);
