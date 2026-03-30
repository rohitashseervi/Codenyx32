const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: String,
  name: String,
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },
  expertSubjects: [String],
  languagesSpoken: [String],
  maxStudents: {
    type: Number,
    default: 5
  },
  currentStudentCount: {
    type: Number,
    default: 0
  },
  behavioralProfile: mongoose.Schema.Types.Mixed,
  yearsExperience: Number,
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mentor', MentorSchema);
