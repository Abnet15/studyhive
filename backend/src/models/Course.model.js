const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
