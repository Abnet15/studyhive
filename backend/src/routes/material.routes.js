const express = require('express');
const { body, param, query } = require('express-validator');
const {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  rateMaterial,
  recordDownload,
  toggleBookmark,
} = require('../controllers/material.controller');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get(
  '/',
  [
    query('courseId').optional().isInt(),
    query('type').optional().isIn(['material', 'exam', 'project', 'note']),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 500 }),
    query('sort').optional().isIn(['recent', 'top-rated', 'popular']),
  ],
  validateRequest,
  optionalAuth, // Allow optional auth so uploaders can see their unapproved materials
  listMaterials
);

router.get('/:id', [param('id').isInt()], validateRequest, getMaterial);

router.post(
  '/',
  requireAuth,
  upload.single('file'),
  [
    body('title').notEmpty(),
    body('courseId').isInt(),
    body('materialType').optional().isIn(['material', 'exam', 'project', 'note']),
  ],
  validateRequest,
  createMaterial
);

router.patch(
  '/:id',
  [
    param('id').isInt(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('material_type').optional().isIn(['material', 'exam', 'project', 'note']),
    body('is_public').optional().isBoolean(),
    body('is_approved').optional().isBoolean(),
  ],
  validateRequest,
  requireAuth,
  updateMaterial
);

router.delete('/:id', [param('id').isInt()], validateRequest, requireAuth, deleteMaterial);

router.post('/:id/download', [param('id').isInt()], validateRequest, optionalAuth, recordDownload);

router.post(
  '/:id/rate',
  [param('id').isInt(), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().isString()],
  validateRequest,
  requireAuth,
  rateMaterial
);

router.post(
  '/:id/bookmark',
  [
    param('id').isInt(),
    body('action').optional().isIn(['add', 'remove', 'toggle']),
  ],
  validateRequest,
  requireAuth,
  toggleBookmark
);

module.exports = router;

