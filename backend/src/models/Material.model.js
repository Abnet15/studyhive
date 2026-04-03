const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  downloads: { type: Number, default: 0 },
  uploader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  // AI Feature fields
  aiSummary: { type: String },
  aiKeyTerms: [{ type: String }],
  aiQuiz: [{
    question: String,
    options: [String],
    answer: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
