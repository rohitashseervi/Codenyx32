const mongoose = require('mongoose');

const NGOSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  location: String,
  contactEmail: String,
  contactPhone: String,
  website: String,
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NGO', NGOSchema);
