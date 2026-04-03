const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Department = require('../models/Department.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const normaliseEmail = (email = '') => email.trim().toLowerCase();

const mapUser = (record) => ({
  id: record._id || record.id,
  fullName: record.fullName,
  email: record.email,
  role: record.role,
  departmentId: record.department_id ? (record.department_id._id || record.department_id) : null,
  departmentName: record.department_id ? record.department_id.name : null,
  academicYear: record.academic_year,
});

const resolveDepartment = async (departmentId, departmentName) => {
  if (departmentId) return departmentId;
  if (!departmentName) return null;
  const cleanName = departmentName.trim();
  if (!cleanName) return null;

  const existing = await Department.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
  if (existing) {
    return existing._id;
  }
  const newDept = await Department.create({ name: cleanName });
  return newDept._id;
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, departmentId, departmentName, academicYear } = req.body;
  const cleanEmail = normaliseEmail(email);

  const existing = await User.findOne({ email: cleanEmail }).select('_id');
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const resolvedDepartmentId = await resolveDepartment(departmentId, departmentName);
  
  const createdUser = await User.create({
    fullName: fullName.trim(),
    email: cleanEmail,
    password_hash: passwordHash,
    department_id: resolvedDepartmentId,
    academic_year: academicYear || null,
    role: 'student'
  });

  const populatedUser = await User.findById(createdUser._id).populate('department_id');

  const token = signToken({ sub: createdUser._id, role: 'student' });
  res.status(201).json({
    token,
    user: mapUser(populatedUser),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = normaliseEmail(email);

  const user = await User.findOne({ email: cleanEmail }).populate('department_id');
  
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new ApiError(401, 'Invalid credentials');
  }

  user.last_login_at = new Date();
  await user.save();

  const token = signToken({ sub: user._id, role: user.role });
  res.json({
    token,
    user: mapUser(user),
  });
});

const profile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('department_id');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    user: mapUser(user),
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('password_hash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  user.password_hash = newHash;
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, academicYear } = req.body;
  const updateData = {};

  if (typeof fullName !== 'undefined' && fullName.trim()) {
    updateData.fullName = fullName.trim();
  }
  if (typeof academicYear !== 'undefined') {
    updateData.academic_year = academicYear ? Number(academicYear) : null;
  }

  if (Object.keys(updateData).length === 0) {
    return res.json({ message: 'Nothing to update' });
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).populate('department_id');

  res.json({ message: 'Profile updated', user: mapUser(user) });
});

module.exports = {
  register,
  login,
  profile,
  changePassword,
  updateProfile,
};
