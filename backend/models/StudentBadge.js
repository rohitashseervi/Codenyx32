const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    earnedThrough: {
      type: String,
      enum: ['automatic', 'manual', 'mentor_awarded'],
      default: 'automatic',
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    awardedAt: {
      type: Date,
      default: null,
    },
    awardReason: {
      type: String,
      default: '',
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
    },
    testResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestResult',
      default: null,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
      default: null,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Compound index for uniqueness
studentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true });

// Indexes
studentBadgeSchema.index({ ngoId: 1 });
studentBadgeSchema.index({ earnedAt: -1 });
studentBadgeSchema.index({ visible: 1 });

// Virtual for days since earned
studentBadgeSchema.virtual('daysSinceEarned').get(function () {
  return Math.floor((new Date() - this.earnedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is recent
studentBadgeSchema.virtual('isRecent').get(function () {
  const daysSince = this.daysSinceEarned;
  return daysSince <= 7;
});

// Pre-save hook
studentBadgeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to send notification
studentBadgeSchema.methods.sendNotification = function () {
  this.notificationSent = true;
  this.notificationSentAt = new Date();
  return this.save();
};

// Method to hide badge
studentBadgeSchema.methods.hide = function () {
  this.visible = false;
  return this.save();
};

// Method to show badge
studentBadgeSchema.methods.show = function () {
  this.visible = true;
  return this.save();
};

// Method to mark as manually awarded
studentBadgeSchema.methods.awardManually = function (awardedBy, reason) {
  this.earnedThrough = 'mentor_awarded';
  this.awardedBy = awardedBy;
  this.awardReason = reason;
  this.awardedAt = new Date();
  return this.save();
};

// Static method to find by student
studentBadgeSchema.statics.findByStudent = function (studentId) {
  return this.find({ studentId, visible: true }).populate('badgeId').sort({ earnedAt: -1 });
};

// Static method to find recent badges for student
studentBadgeSchema.statics.findRecentByStudent = function (studentId, days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({
    studentId,
    earnedAt: { $gte: date },
    visible: true,
  }).populate('badgeId');
};

// Static method to find by badge
studentBadgeSchema.statics.findByBadge = function (badgeId) {
  return this.find({ badgeId, visible: true });
};

// Static method to get badge count for student
studentBadgeSchema.statics.getStudentBadgeCount = function (studentId) {
  return this.countDocuments({ studentId, visible: true });
};

// Static method to find students with specific badge
studentBadgeSchema.statics.findStudentsWithBadge = function (badgeId) {
  return this.find({ badgeId, visible: true }).distinct('studentId');
};

// Static method to find pending notifications
studentBadgeSchema.statics.findPendingNotifications = function (ngoId) {
  return this.find({
    ngoId,
    notificationSent: false,
  }).populate(['studentId', 'badgeId']);
};

// Static method to find newly earned badges by NGO
studentBadgeSchema.statics.findRecentByNGO = function (ngoId, limit = 20) {
  return this.find({ ngoId, visible: true }).sort({ earnedAt: -1 }).limit(limit).populate(['studentId', 'badgeId']);
};

const StudentBadge = mongoose.model('StudentBadge', studentBadgeSchema);

module.exports = StudentBadge;
