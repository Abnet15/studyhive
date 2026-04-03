const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  academic_year: { type: Number },
  last_login_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
