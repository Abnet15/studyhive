const express = require('express');
const { body, param, query } = require('express-validator');
const {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  [
    query('departmentId').optional().isMongoId(),
    query('search').optional().isString(),
    query('includeInactive').optional().isBoolean(),
  ],
  validateRequest,
  listCourses
);

router.post(
  '/',
  [
    body('courseCode').notEmpty().withMessage('courseCode is required'),
    body('courseName').notEmpty().withMessage('courseName is required'),
    body('description').optional().isString(),
    body('departmentId').optional().isMongoId(),
    body('yearOffered').optional().isInt({ min: 1, max: 6 }),
  ],
  validateRequest,
  requireAuth,
  requireAdmin,
  createCourse
);

router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('courseName').optional().isString(),
    body('description').optional().isString(),
    body('departmentId').optional().isMongoId(),
    body('yearOffered').optional().isInt({ min: 1, max: 6 }),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  requireAuth,
  requireAdmin,
  updateCourse
);

router.delete(
  '/:id',
  [param('id').isMongoId()],
  validateRequest,
  requireAuth,
  requireAdmin,
  deleteCourse
);

module.exports = router;

