const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');

const normaliseEmail = (email = '') => email.trim().toLowerCase();

const mapUser = (record) => ({
  id: record.id,
  fullName: record.full_name,
  email: record.email,
  role: record.role,
  departmentId: record.department_id,
  departmentName: record.department_name,
  academicYear: record.academic_year,
});

const resolveDepartment = async (departmentId, departmentName) => {
  if (departmentId) return departmentId;
  if (!departmentName) return null;
  const cleanName = departmentName.trim();
  if (!cleanName) return null;

  const [existing] = await pool.query(
    'SELECT id FROM departments WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [cleanName]
  );
  if (existing.length) {
    return existing[0].id;
  }
  const [result] = await pool.query('INSERT INTO departments (name) VALUES (?)', [cleanName]);
  return result.insertId;
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, departmentId, departmentName, academicYear } = req.body;
  const cleanEmail = normaliseEmail(email);

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
  if (existing.length) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const resolvedDepartmentId = await resolveDepartment(departmentId, departmentName);
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, department_id, academic_year, role)
     VALUES (?, ?, ?, ?, ?, 'student')`,
    [fullName.trim(), cleanEmail, passwordHash, resolvedDepartmentId, academicYear || null]
  );

  const [[created]] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.department_id, u.academic_year, d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.id = ?`,
    [result.insertId]
  );

  const token = signToken({ sub: result.insertId, role: 'student' });
  res.status(201).json({
    token,
    user: mapUser(created),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = normaliseEmail(email);

  const [rows] = await pool.query(
    `SELECT u.id,
            u.full_name,
            u.email,
            u.password_hash,
            u.role,
            u.department_id,
            u.academic_year,
            d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.email = ?
     LIMIT 1`,
    [cleanEmail]
  );

  const user = rows[0];
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new ApiError(401, 'Invalid credentials');
  }

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

  const token = signToken({ sub: user.id, role: user.role });
  res.json({
    token,
    user: mapUser(user),
  });
});

const profile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id,
            u.full_name,
            u.email,
            u.role,
            u.academic_year,
            u.department_id,
            d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.id = ?
     LIMIT 1`,
    [req.user.id]
  );

  if (!rows.length) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    user: mapUser(rows[0]),
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  if (!rows.length) {
    throw new ApiError(404, 'User not found');
  }

  const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!match) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

  res.json({ message: 'Password changed successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, academicYear } = req.body;
  const updates = [];
  const params = [];

  if (typeof fullName !== 'undefined' && fullName.trim()) {
    updates.push('full_name = ?');
    params.push(fullName.trim());
  }
  if (typeof academicYear !== 'undefined') {
    updates.push('academic_year = ?');
    params.push(academicYear ? Number(academicYear) : null);
  }

  if (!updates.length) {
    return res.json({ message: 'Nothing to update' });
  }

  params.push(req.user.id);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

  // Return updated profile
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.academic_year, u.department_id, d.name AS department_name
     FROM users u LEFT JOIN departments d ON d.id = u.department_id WHERE u.id = ?`,
    [req.user.id]
  );
  res.json({ message: 'Profile updated', user: mapUser(rows[0]) });
});

module.exports = {
  register,
  login,
  profile,
  changePassword,
  updateProfile,
};

