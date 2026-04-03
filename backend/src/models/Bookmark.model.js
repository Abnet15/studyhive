const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true }
}, { timestamps: true });

// One bookmark per user per material
BookmarkSchema.index({ user_id: 1, material_id: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
