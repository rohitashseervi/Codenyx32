const mongoose = require('mongoose');

const LearningModuleSchema = new mongoose.Schema({
  title: String,
  subject: String,
  grade: String,
  order: Number,
  durationMinutes: Number,
  description: String,
  content: String,
  resources: [String],
  learningOutcomes: [String],
  createdAt: Date
});

module.exports = mongoose.model('LearningModule', LearningModuleSchema);
