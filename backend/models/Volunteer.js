const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
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
  subjects: [String],
  gradeBand: [String],
  timeSlots: [{
    dayOfWeek: String,
    startTime: String,
    endTime: String,
    duration: Number
  }],
  duration: Number,
  languages: [String],
  bio: String,
  qualifications: [String],
  learningPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath'
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
