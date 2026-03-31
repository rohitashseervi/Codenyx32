const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'volunteer', 'mentor', 'ngo_admin'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Simple password hashing (no bcrypt dependency needed)
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  if (!this.salt) {
    // For users created with plain text password, do direct comparison
    return this.password === password;
  }
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.password === hash;
};

// Add salt field
UserSchema.add({ salt: String });

module.exports = mongoose.model('User', UserSchema);
