const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  badgeId: String,
  name: String,
  description: String,
  icon: String,
  rarity: String,
  criteria: String,
  createdAt: Date
});

module.exports = mongoose.model('Badge', BadgeSchema);
