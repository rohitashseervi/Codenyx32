const mongoose = require('mongoose');

const MentorNoteSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  content: String,
  category: {
    type: String,
    enum: ['general', 'feedback', 'weak-area', 'strength', 'action-item'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MentorNote', MentorNoteSchema);
