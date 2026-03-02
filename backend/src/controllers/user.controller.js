const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id,
            u.full_name,
            u.email,
            u.role,
            u.academic_year,
            u.department_id,
            u.is_active,
            u.last_login_at,
            u.created_at,
            d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     ORDER BY u.created_at DESC`
  );

  res.json({
    users: rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      academicYear: row.academic_year,
      departmentId: row.department_id,
      departmentName: row.department_name,
      isActive: !!row.is_active,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
    })),
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (Number.isNaN(targetId)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [targetId]);
  const target = rows[0];
  if (!target) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent modifying other admin accounts
  if (target.role === 'admin' && targetId !== req.user.id) {
    throw new ApiError(400, 'Cannot modify another admin account.');
  }

  const { role, isActive } = req.body;
  const updates = [];
  const params = [];

  if (typeof role !== 'undefined') {
    const allowed = ['student', 'moderator', 'admin'];
    if (!allowed.includes(role)) {
      throw new ApiError(400, `Invalid role. Allowed: ${allowed.join(', ')}`);
    }
    // Prevent demoting yourself
    if (targetId === req.user.id && role !== 'admin') {
      throw new ApiError(400, 'You cannot demote your own admin account.');
    }
    updates.push('role = ?');
    params.push(role);
  }

  if (typeof isActive !== 'undefined') {
    // Prevent deactivating yourself
    if (targetId === req.user.id && !isActive) {
      throw new ApiError(400, 'You cannot deactivate your own account.');
    }
    updates.push('is_active = ?');
    params.push(isActive ? 1 : 0);
  }

  if (!updates.length) {
    return res.json({ message: 'Nothing to update' });
  }

  params.push(targetId);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  res.json({ message: 'User updated successfully' });
});

const deleteUser = asyncHandler(async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (Number.isNaN(targetId)) {
    throw new ApiError(400, 'Invalid user id');
  }
  if (targetId === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  const [rows] = await pool.query('SELECT role FROM users WHERE id = ? LIMIT 1', [targetId]);
  const target = rows[0];
  if (!target) {
    throw new ApiError(404, 'User not found');
  }
  if (target.role === 'admin') {
    throw new ApiError(400, 'Cannot delete another admin account.');
  }

  await pool.query('DELETE FROM users WHERE id = ?', [targetId]);
  res.json({ message: 'User removed' });
});

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
};
