const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
      index: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
    },
    testNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    answers: [
      {
        questionId: {
          type: String,
          required: true,
        },
        questionText: String,
        studentAnswer: {
          type: String,
          required: true,
        },
        correctAnswer: String,
        isCorrect: {
          type: Boolean,
          required: true,
        },
        pointsObtained: {
          type: Number,
          default: 0,
        },
        maxPoints: {
          type: Number,
          default: 1,
        },
        timeSpent: {
          type: Number,
          default: null,
        },
        _id: false,
      },
    ],
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    pointsObtained: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
    },
    unansweredQuestions: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: null,
    },
    averageTimePerQuestion: {
      type: Number,
      default: null,
    },
    masteryLevel: {
      type: String,
      enum: {
        values: ['needs_help', 'developing', 'mastered'],
        message: 'Invalid mastery level',
      },
      required: true,
    },
    questionAnalysis: {
      easiestQuestion: {
        questionId: String,
        masteryLevel: String,
      },
      hardestQuestion: {
        questionId: String,
        masteryLevel: String,
      },
      topicWisePerformance: Map,
    },
    skillAssessment: {
      conceptsGrasped: [String],
      conceptsNeedingWork: [String],
      suggestedTopics: [String],
    },
    performanceTrend: {
      previousScores: [Number],
      scoreImprovement: Number,
      improvementPercentage: Number,
    },
    feedback: {
      automaticFeedback: String,
      volunteerFeedback: String,
      parentalFeedback: String,
      feedbackProvidedAt: Date,
    },
    studentReflection: {
      howWasIt: String,
      whatWasDifficult: String,
      whatWasEasy: String,
      submittedAt: Date,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    mentorNotified: {
      type: Boolean,
      default: false,
    },
    parentalNotified: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
      default: null,
    },
    flagForReview: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: null,
    },
    tags: [String],
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

// Indexes
testResultSchema.index({ studentId: 1, assessmentId: 1 });
testResultSchema.index({ ngoId: 1, submittedAt: -1 });
testResultSchema.index({ masteryLevel: 1 });
testResultSchema.index({ volunteerId: 1 });

// Virtual for accuracy
testResultSchema.virtual('accuracy').get(function () {
  if (this.totalQuestions === 0) return 0;
  return ((this.correctAnswers / this.totalQuestions) * 100).toFixed(2);
});

// Virtual for pass/fail status
testResultSchema.virtual('passed').get(function () {
  return this.score >= 60;
});

// Virtual for performance label
testResultSchema.virtual('performanceLabel').get(function () {
  if (this.score >= 80) return 'Excellent';
  if (this.score >= 60) return 'Good';
  if (this.score >= 40) return 'Fair';
  return 'Needs Improvement';
});

// Pre-save hook
testResultSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Calculate derived values
  this.incorrectAnswers = this.totalQuestions - this.correctAnswers - this.unansweredQuestions;
  this.averageTimePerQuestion = this.timeTaken ? Math.round(this.timeTaken / this.totalQuestions) : null;

  // Determine mastery level based on score
  if (this.score >= 80) {
    this.masteryLevel = 'mastered';
  } else if (this.score >= 60) {
    this.masteryLevel = 'developing';
  } else {
    this.masteryLevel = 'needs_help';
  }

  // Calculate improvement
  if (this.performanceTrend.previousScores && this.performanceTrend.previousScores.length > 0) {
    const previousAvg =
      this.performanceTrend.previousScores.reduce((a, b) => a + b, 0) / this.performanceTrend.previousScores.length;
    this.performanceTrend.scoreImprovement = this.score - previousAvg;
    this.performanceTrend.improvementPercentage = ((this.scoreImprovement / previousAvg) * 100).toFixed(2);
  }

  next();
});

// Method to add answer
testResultSchema.methods.addAnswer = function (questionId, studentAnswer, correctAnswer, isCorrect, maxPoints) {
  const answer = {
    questionId,
    studentAnswer,
    correctAnswer,
    isCorrect,
    pointsObtained: isCorrect ? maxPoints : 0,
    maxPoints,
  };

  this.answers.push(answer);

  if (isCorrect) {
    this.correctAnswers += 1;
    this.pointsObtained += maxPoints;
  }

  this.score = (this.pointsObtained / this.totalPoints) * 100;

  return this.save();
};

// Method to add volunteer feedback
testResultSchema.methods.addVolunteerFeedback = function (feedback) {
  this.feedback.volunteerFeedback = feedback;
  this.feedback.feedbackProvidedAt = new Date();
  this.reviewedAt = new Date();
  this.mentorNotified = true;
  this.notificationSentAt = new Date();
  return this.save();
};

// Method to add student reflection
testResultSchema.methods.addStudentReflection = function (reflection) {
  this.studentReflection = {
    ...reflection,
    submittedAt: new Date(),
  };
  return this.save();
};

// Method to flag for review
testResultSchema.methods.flagForReview = function (reason) {
  this.flagForReview = true;
  this.flagReason = reason;
  return this.save();
};

// Method to mark as reviewed
testResultSchema.methods.markAsReviewed = function (reviewedBy) {
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to notify mentor
testResultSchema.methods.notifyMentor = function () {
  this.mentorNotified = true;
  this.notificationSentAt = new Date();
  return this.save();
};

// Method to notify parent
testResultSchema.methods.notifyParent = function () {
  this.parentalNotified = true;
  return this.save();
};

// Method to generate feedback
testResultSchema.methods.generateAutomaticFeedback = function () {
  let feedback = '';

  if (this.masteryLevel === 'mastered') {
    feedback = `Excellent work! You have mastered this topic with a score of ${this.score}%. Keep up the great effort!`;
  } else if (this.masteryLevel === 'developing') {
    feedback = `Good progress! You scored ${this.score}%. Focus on the areas marked below to improve further.`;
  } else {
    feedback = `You need more practice. You scored ${this.score}%. Review the concepts and try again.`;
  }

  if (this.skillAssessment.conceptsNeedingWork && this.skillAssessment.conceptsNeedingWork.length > 0) {
    feedback += ` Pay special attention to: ${this.skillAssessment.conceptsNeedingWork.join(', ')}.`;
  }

  this.feedback.automaticFeedback = feedback;
  return this.save();
};

// Method to update topic performance
testResultSchema.methods.analyzePerformance = function () {
  const topicPerformance = {};

  this.answers.forEach((answer) => {
    // This would need to be implemented based on your assessment structure
    // For now, we'll create a placeholder
    if (!topicPerformance[answer.questionId]) {
      topicPerformance[answer.questionId] = {
        correct: answer.isCorrect ? 1 : 0,
        total: 1,
      };
    } else {
      if (answer.isCorrect) topicPerformance[answer.questionId].correct += 1;
      topicPerformance[answer.questionId].total += 1;
    }
  });

  this.questionAnalysis.topicWisePerformance = topicPerformance;

  // Find hardest and easiest questions
  let hardest = null;
  let easiest = null;
  let maxDifficulty = -1;
  let minDifficulty = 101;

  this.answers.forEach((answer) => {
    if (answer.isCorrect && minDifficulty > 0) {
      minDifficulty = 0;
      easiest = { questionId: answer.questionId };
    } else if (!answer.isCorrect && maxDifficulty < 100) {
      maxDifficulty = 100;
      hardest = { questionId: answer.questionId };
    }
  });

  if (hardest) this.questionAnalysis.hardestQuestion = hardest;
  if (easiest) this.questionAnalysis.easiestQuestion = easiest;

  return this.save();
};

// Static method to find by student and assessment
testResultSchema.statics.findByStudentAndAssessment = function (studentId, assessmentId) {
  return this.findOne({ studentId, assessmentId });
};

// Static method to get student's test history
testResultSchema.statics.getStudentHistory = function (studentId, limit = 10) {
  return this.find({ studentId }).sort({ submittedAt: -1 }).limit(limit);
};

// Static method to find results needing review
testResultSchema.statics.findNeedingReview = function (ngoId) {
  return this.find({ ngoId, flagForReview: true, reviewedBy: null });
};

// Static method to find low performers
testResultSchema.statics.findLowPerformers = function (ngoId, threshold = 40) {
  return this.find({ ngoId, score: { $lt: threshold } });
};

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
