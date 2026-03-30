const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: String,
  name: String,
  grade: String,
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },
  classGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  language: {
    type: String,
    default: 'English'
  },
  weakAreas: [String],
  baseline: mongoose.Schema.Types.Mixed,
  currentMentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  assessmentHistory: [{
    assessmentId: mongoose.Schema.Types.ObjectId,
    subject: String,
    topic: String,
    score: Number,
    date: Date
  }],
  matchHistory: [{
    mentorId: mongoose.Schema.Types.ObjectId,
    matchedAt: Date,
    matchScore: Number
  }],
  activityLog: [{
    type: String,
    date: Date,
    details: mongoose.Schema.Types.Mixed
  }],
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    rarity: String,
    earnedAt: Date
  }],
  currentStreak: {
    type: Number,
    default: 0
  },
  learningNeed: String,
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
