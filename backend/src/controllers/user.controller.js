const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().populate('department_id').sort({ createdAt: -1 });

  res.json({
    users: users.map((user) => ({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      academicYear: user.academic_year,
      departmentId: user.department_id ? user.department_id._id : null,
      departmentName: user.department_id ? user.department_id.name : null,
      lastLoginAt: user.last_login_at,
      createdAt: user.createdAt,
    })),
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  const target = await User.findById(targetId);
  if (!target) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent modifying other admin accounts
  if (target.role === 'admin' && targetId !== req.user.id) {
    throw new ApiError(400, 'Cannot modify another admin account.');
  }

  const { role } = req.body;
  const updateData = {};

  if (typeof role !== 'undefined') {
    const allowed = ['student', 'teacher', 'admin'];
    if (!allowed.includes(role)) {
      throw new ApiError(400, `Invalid role. Allowed: ${allowed.join(', ')}`);
    }
    // Prevent demoting yourself
    if (targetId === req.user.id && role !== 'admin') {
      throw new ApiError(400, 'You cannot demote your own admin account.');
    }
    updateData.role = role;
  }

  if (Object.keys(updateData).length === 0) {
    return res.json({ message: 'Nothing to update' });
  }

  await User.findByIdAndUpdate(targetId, updateData);

  res.json({ message: 'User updated successfully' });
});

const deleteUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  const target = await User.findById(targetId);
  if (!target) {
    throw new ApiError(404, 'User not found');
  }
  if (target.role === 'admin') {
    throw new ApiError(400, 'Cannot delete another admin account.');
  }

  await User.findByIdAndDelete(targetId);
  res.json({ message: 'User removed' });
});

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
};
