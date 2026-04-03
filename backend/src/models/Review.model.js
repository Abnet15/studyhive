const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { timestamps: true });

// One review per user per material
ReviewSchema.index({ material_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
