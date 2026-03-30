const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  title: String,
  subject: String,
  topic: String,
  grade: String,
  difficulty: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    section: String
  }],
  totalQuestions: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  },
  classGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  source: String,
  submissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    studentName: String,
    answers: [String],
    score: Number,
    detailedResults: [{
      questionIndex: Number,
      studentAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
      explanation: String
    }],
    submittedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
