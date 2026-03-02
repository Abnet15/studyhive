const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listCourses = asyncHandler(async (req, res) => {
  const { departmentId, search, includeInactive } = req.query;
  const params = [];
  let query = `
    SELECT c.id,
           c.course_code,
           c.course_name,
           c.description,
           c.year_offered,
           c.is_active,
           d.name AS department_name
    FROM courses c
    LEFT JOIN departments d ON d.id = c.department_id
    WHERE 1 = 1
  `;

  if (!includeInactive) {
    query += ' AND c.is_active = 1';
  }
  if (departmentId) {
    query += ' AND c.department_id = ?';
    params.push(departmentId);
  }
  if (search) {
    query += ' AND (c.course_name LIKE ? OR c.course_code LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY c.course_code';

  const [rows] = await pool.query(query, params);

  res.json({
    courses: rows.map((row) => ({
      id: row.id,
      code: row.course_code,
      name: row.course_name,
      description: row.description,
      yearOffered: row.year_offered,
      active: !!row.is_active,
      departmentName: row.department_name,
    })),
  });
});

const createCourse = asyncHandler(async (req, res) => {
  const { courseCode, courseName, description, departmentId, yearOffered } = req.body;
  const [existing] = await pool.query('SELECT id FROM courses WHERE course_code = ? LIMIT 1', [
    courseCode,
  ]);
  if (existing.length) {
    throw new ApiError(409, 'Course code already exists');
  }

  const [result] = await pool.query(
    `INSERT INTO courses (course_code, course_name, description, department_id, year_offered, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [courseCode, courseName, description || null, departmentId || null, yearOffered || null]
  );

  res.status(201).json({
    course: {
      id: result.insertId,
      code: courseCode,
      name: courseName,
      description,
      departmentId,
      yearOffered,
      active: true,
    },
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseName, description, departmentId, yearOffered, isActive } = req.body;

  const [result] = await pool.query(
    `UPDATE courses
     SET course_name = COALESCE(?, course_name),
         description = COALESCE(?, description),
         department_id = COALESCE(?, department_id),
         year_offered = COALESCE(?, year_offered),
         is_active = COALESCE(?, is_active)
     WHERE id = ?`,
    [courseName, description, departmentId, yearOffered, isActive, id]
  );

  if (!result.affectedRows) {
    throw new ApiError(404, 'Course not found');
  }

  res.json({ message: 'Course updated' });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('UPDATE courses SET is_active = 0 WHERE id = ?', [id]);
  if (!result.affectedRows) {
    throw new ApiError(404, 'Course not found');
  }
  res.json({ message: 'Course archived' });
});

module.exports = {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};

