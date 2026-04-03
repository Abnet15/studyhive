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

  // ── Honey AI Feature Fields ──────────────────────────────
  aiSummary: { type: String },
  aiKeyTerms: [{ type: String }],
  aiTopics: [{ type: String }],           // High-level topics for recommendations
  aiContentValid: { type: Boolean, default: true }, // Content validation gate
  aiQuiz: [{
    question: String,
    options: [String],
    answer: String
  }]
}, { timestamps: true });

// Text index for smart search across title, description, AI key terms, and topics
MaterialSchema.index({
  title: 'text',
  description: 'text',
  aiKeyTerms: 'text',
  aiTopics: 'text',
  aiSummary: 'text'
});

module.exports = mongoose.model('Material', MaterialSchema);
