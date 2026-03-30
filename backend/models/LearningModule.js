const mongoose = require('mongoose');

const LearningModuleSchema = new mongoose.Schema({
  subject: { type: String, required: true, enum: ['Math', 'English', 'Hindi', 'Telugu', 'EVS'] },
  grade: { type: Number, required: true, min: 1, max: 5 },
  topic: { type: String, required: true },
  order: { type: Number, required: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningModule' }],
  teachingGuide: { type: String, required: true },
  activities: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, default: 15 }
  }],
  estimatedDuration: { type: Number, default: 45 },
  learningOutcomes: [String],
  createdAt: { type: Date, default: Date.now }
});

LearningModuleSchema.index({ subject: 1, grade: 1, order: 1 });

module.exports = mongoose.model('LearningModule', LearningModuleSchema);
