const mongoose = require('mongoose');

const NGOAdminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: String,
  name: String,
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO'
  },
  role: {
    type: String,
    enum: ['admin', 'coordinator', 'analyst'],
    default: 'coordinator'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NGOAdmin', NGOAdminSchema);
