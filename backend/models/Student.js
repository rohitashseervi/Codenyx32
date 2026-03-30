const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: String,
  name: { type: String, required: true },
  grade: { type: Number, required: true, min: 1, max: 5 },
  school: String,
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  classGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  language: {
    type: String,
    default: 'English'
  },
  guardianPhone: String,
  guardianEmail: String,
  weakAreas: [String],
  baselineScores: mongoose.Schema.Types.Mixed,
  currentMentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  assessmentHistory: [{
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    subject: String,
    topic: String,
    score: Number,
    masteryLevel: { type: String, enum: ['needs_help', 'developing', 'mastered'] },
    date: { type: Date, default: Date.now }
  }],
  matchHistory: [{
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    matchedAt: Date,
    endedAt: Date,
    matchScore: Number,
    reason: String
  }],
  activityLog: [{
    action: String,
    date: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],
  badges: [{
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    name: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  consistencyStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
});

StudentSchema.index({ ngoId: 1, grade: 1 });
StudentSchema.index({ currentMentorId: 1 });
StudentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', StudentSchema);
