const mongoose = require('mongoose');

const ExamScoreSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  scores: [{
    competency: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    maxScore: { type: Number, required: true, default: 5 }
  }],
  totalScore: {
    type: Number,
    required: true
  },
  totalMaxScore: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExamScore', ExamScoreSchema);
