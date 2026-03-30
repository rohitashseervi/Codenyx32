const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['pdf', 'doc', 'link', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true
  },
  subject: String,
  grade: String,
  visibility: {
    type: String,
    enum: ['all', 'class-only'],
    default: 'all'
  },
  classGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);
