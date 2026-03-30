const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    classGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassGroup',
      default: null,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      enum: ['Math', 'EVS', 'Telugu', 'English', 'Hindi', 'Science', 'Social Studies'],
      required: true,
    },
    grade: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: null,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'],
    },
    duration: {
      type: Number,
      required: true,
      min: 15,
      default: 45,
    },
    location: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    meetLink: {
      type: String,
      default: null,
    },
    meetEventId: {
      type: String,
      default: null,
    },
    recordingLink: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
        message: 'Invalid status',
      },
      default: 'scheduled',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    actualDuration: {
      type: Number,
      default: null,
    },
    attendees: {
      volunteerAttended: {
        type: Boolean,
        default: null,
      },
      studentAttendance: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
          },
          attended: Boolean,
          arrivedAt: Date,
          leftAt: Date,
          notes: String,
        },
      ],
      totalAttended: {
        type: Number,
        default: 0,
      },
    },
    content: {
      topicsCovered: [String],
      activitiesCompleted: [String],
      paceOfLesson: {
        type: String,
        enum: ['slow', 'normal', 'fast'],
        default: 'normal',
      },
      studentEngagementLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      materialsUsed: [String],
    },
    assessmentData: {
      assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        default: null,
      },
      testStartTime: Date,
      testEndTime: Date,
      studentsWhoTested: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
      ],
    },
    volunteerNotes: {
      strengthsObserved: [String],
      areasForImprovement: [String],
      generalNotes: String,
      nextSessionFocus: String,
      studentsBehind: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
      ],
      studentsAdvanced: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
      ],
    },
    feedback: {
      volunteerFeedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
          default: null,
        },
        comments: String,
        submittedAt: Date,
      },
      studentFeedback: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
          },
          comments: String,
          submittedAt: Date,
        },
      ],
    },
    issues: [
      {
        type: String,
        description: String,
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        resolved: Boolean,
        resolutionNotes: String,
      },
    ],
    followUpTasks: [
      {
        task: String,
        assignedTo: mongoose.Schema.Types.ObjectId,
        dueDate: Date,
        completed: Boolean,
        completedAt: Date,
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

// Indexes
sessionSchema.index({ classGroupId: 1, date: -1 });
sessionSchema.index({ volunteerId: 1, date: -1 });
sessionSchema.index({ ngoId: 1, date: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ moduleId: 1 });

// Virtual for session time string
sessionSchema.virtual('sessionTimeString').get(function () {
  return this.scheduledTime;
});

// Virtual for attendance rate
sessionSchema.virtual('attendanceRate').get(function () {
  if (this.studentIds.length === 0) return 0;
  return (this.attendees.totalAttended / this.studentIds.length) * 100;
});

// Virtual for is upcoming
sessionSchema.virtual('isUpcoming').get(function () {
  return this.date > new Date() && this.status === 'scheduled';
});

// Virtual for is overdue
sessionSchema.virtual('isOverdue').get(function () {
  return this.date < new Date() && this.status === 'scheduled';
});

// Pre-save hook
sessionSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Calculate actual duration if both times are set
  if (this.actualStartTime && this.actualEndTime) {
    this.actualDuration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }

  next();
});

// Method to start session
sessionSchema.methods.startSession = function () {
  this.status = 'in_progress';
  this.actualStartTime = new Date();
  return this.save();
};

// Method to end session
sessionSchema.methods.endSession = function () {
  this.status = 'completed';
  this.actualEndTime = new Date();
  return this.save();
};

// Method to cancel session
sessionSchema.methods.cancelSession = function (reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  return this.save();
};

// Method to record attendance
sessionSchema.methods.recordAttendance = function (studentId, attended, arrivedAt, leftAt) {
  const existingRecord = this.attendees.studentAttendance.find(
    (a) => a.studentId.toString() === studentId.toString()
  );

  if (existingRecord) {
    existingRecord.attended = attended;
    existingRecord.arrivedAt = arrivedAt;
    existingRecord.leftAt = leftAt;
  } else {
    this.attendees.studentAttendance.push({
      studentId,
      attended,
      arrivedAt,
      leftAt,
    });
  }

  // Update total attended count
  this.attendees.totalAttended = this.attendees.studentAttendance.filter((a) => a.attended).length;

  return this.save();
};

// Method to add volunteer notes
sessionSchema.methods.addVolunteerNotes = function (notes) {
  if (notes.strengthsObserved) {
    this.volunteerNotes.strengthsObserved = notes.strengthsObserved;
  }
  if (notes.areasForImprovement) {
    this.volunteerNotes.areasForImprovement = notes.areasForImprovement;
  }
  if (notes.generalNotes) {
    this.volunteerNotes.generalNotes = notes.generalNotes;
  }
  if (notes.nextSessionFocus) {
    this.volunteerNotes.nextSessionFocus = notes.nextSessionFocus;
  }
  if (notes.studentsBehind) {
    this.volunteerNotes.studentsBehind = notes.studentsBehind;
  }
  if (notes.studentsAdvanced) {
    this.volunteerNotes.studentsAdvanced = notes.studentsAdvanced;
  }
  return this.save();
};

// Method to add feedback
sessionSchema.methods.addFeedback = function (type, rating, comments) {
  if (type === 'volunteer') {
    this.feedback.volunteerFeedback.rating = rating;
    this.feedback.volunteerFeedback.comments = comments;
    this.feedback.volunteerFeedback.submittedAt = new Date();
  }
  return this.save();
};

// Method to add student feedback
sessionSchema.methods.addStudentFeedback = function (studentId, rating, comments) {
  const existingFeedback = this.feedback.studentFeedback.find(
    (f) => f.studentId.toString() === studentId.toString()
  );

  if (existingFeedback) {
    existingFeedback.rating = rating;
    existingFeedback.comments = comments;
    existingFeedback.submittedAt = new Date();
  } else {
    this.feedback.studentFeedback.push({
      studentId,
      rating,
      comments,
      submittedAt: new Date(),
    });
  }

  return this.save();
};

// Method to add issue
sessionSchema.methods.addIssue = function (issueData) {
  this.issues.push({
    ...issueData,
    resolved: false,
  });
  return this.save();
};

// Method to resolve issue
sessionSchema.methods.resolveIssue = function (issueIndex, resolutionNotes) {
  if (issueIndex >= 0 && issueIndex < this.issues.length) {
    this.issues[issueIndex].resolved = true;
    this.issues[issueIndex].resolutionNotes = resolutionNotes;
  }
  return this.save();
};

// Method to add follow-up task
sessionSchema.methods.addFollowUpTask = function (task, assignedTo, dueDate) {
  this.followUpTasks.push({
    task,
    assignedTo,
    dueDate,
    completed: false,
  });
  return this.save();
};

// Static method to find by date range
sessionSchema.statics.findByDateRange = function (ngoId, startDate, endDate) {
  return this.find({
    ngoId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

// Static method to find upcoming sessions
sessionSchema.statics.findUpcoming = function (volunteerId) {
  const now = new Date();
  return this.find({
    volunteerId,
    date: { $gte: now },
    status: 'scheduled',
  }).sort({ date: 1 });
};

// Static method to find completed sessions
sessionSchema.statics.findCompleted = function (ngoId) {
  return this.find({ ngoId, status: 'completed' });
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
