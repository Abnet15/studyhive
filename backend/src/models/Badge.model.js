const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  iconUrl: { type: String },
  criteria: { type: String }, // e.g. "Upload 5 materials"
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema);
