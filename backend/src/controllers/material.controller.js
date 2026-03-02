const path = require('path');
const slugify = require('slugify');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const materialColumns = `
  cm.id,
  cm.course_id,
  cm.uploader_id,
  cm.title,
  cm.slug,
  cm.description,
  cm.file_path,
  cm.original_file_name,
  cm.file_type,
  cm.file_size,
  cm.material_type,
  cm.rating_avg,
  cm.rating_count,
  cm.downloads,
  cm.is_public,
  cm.is_approved,
  cm.uploaded_at,
  c.course_code,
  c.course_name,
  u.full_name AS uploader_name
`;

const buildSlug = async (title) => {
  const base = slugify(title, { lower: true, strict: true }) || `material-${Date.now()}`;
  let slug = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const [rows] = await pool.query('SELECT id FROM course_materials WHERE slug = ? LIMIT 1', [
      slug,
    ]);
    if (!rows.length) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
};

const listMaterials = asyncHandler(async (req, res) => {
  const { courseId, type, search, limit = 30, sort = 'recent' } = req.query;
  const userId = req.user?.id || null;
  const params = [];
  // Show approved materials to everyone, or unapproved materials to their uploader
  let query = `
    SELECT ${materialColumns}
    FROM course_materials cm
    INNER JOIN courses c ON c.id = cm.course_id
    INNER JOIN users u ON u.id = cm.uploader_id
    WHERE cm.is_public = 1 AND (cm.is_approved = 1${userId ? ' OR cm.uploader_id = ?' : ''})
  `;
  if (userId) {
    params.push(userId);
  }

  if (courseId) {
    query += ' AND cm.course_id = ?';
    params.push(courseId);
  }
  if (type) {
    query += ' AND cm.material_type = ?';
    params.push(type);
  }
  if (search) {
    query += ' AND MATCH(cm.title, cm.description) AGAINST (? IN NATURAL LANGUAGE MODE)';
    params.push(search);
  }

  if (sort === 'top-rated') {
    query += ' ORDER BY cm.rating_avg DESC';
  } else if (sort === 'popular') {
    query += ' ORDER BY cm.downloads DESC';
  } else {
    query += ' ORDER BY cm.uploaded_at DESC';
  }

  query += ' LIMIT ?';
  params.push(Number(limit));

  const [rows] = await pool.query(query, params);

  res.json({
    materials: rows.map((row) => ({
      id: row.id,
      course_id: row.course_id,
      uploader_id: row.uploader_id,
      title: row.title,
      description: row.description || '',
      fileUrl: row.file_path || null,
      file_path: row.file_path || null,
      originalFileName: row.original_file_name || null,
      fileType: row.file_type || null,
      fileSize: row.file_size || 0,
      materialType: row.material_type || 'material',
      rating: row.rating_avg || 0,
      ratingCount: row.rating_count || 0,
      downloads: row.downloads || 0,
      uploadedAt: row.uploaded_at,
      courseCode: row.course_code || null,
      courseName: row.course_name || null,
      uploaderName: row.uploader_name || 'Unknown',
    })),
  });
});

const getMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `
    SELECT ${materialColumns},
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', mr.id,
               'rating', mr.rating,
               'comment', mr.comment,
               'userId', mr.user_id,
               'createdAt', mr.created_at
             )
           ) AS reviews
    FROM course_materials cm
    INNER JOIN courses c ON c.id = cm.course_id
    INNER JOIN users u ON u.id = cm.uploader_id
    LEFT JOIN material_reviews mr ON mr.material_id = cm.id
    WHERE cm.id = ?
    GROUP BY cm.id
  `,
    [id]
  );

  if (!rows.length) {
    throw new ApiError(404, 'Material not found');
  }

  const item = rows[0];
  res.json({
    material: {
      id: item.id,
      course_id: item.course_id,
      uploader_id: item.uploader_id,
      title: item.title,
      description: item.description || '',
      fileUrl: item.file_path || null,
      file_path: item.file_path || null,
      originalFileName: item.original_file_name || null,
      fileType: item.file_type || null,
      fileSize: item.file_size || 0,
      materialType: item.material_type || 'material',
      rating: item.rating_avg || 0,
      ratingCount: item.rating_count || 0,
      downloads: item.downloads || 0,
      uploadedAt: item.uploaded_at,
      courseCode: item.course_code || null,
      courseName: item.course_name || null,
      uploaderName: item.uploader_name || 'Unknown',
      reviews: item.reviews ?? [],
    },
  });
});

const createMaterial = asyncHandler(async (req, res) => {
  const { title, description, courseId, materialType } = req.body;

  if (!req.file && !req.body.fileUrl) {
    throw new ApiError(400, 'A file upload or fileUrl is required');
  }

  if (!req.file) {
    throw new ApiError(400, 'File upload is required');
  }

  const slug = await buildSlug(title);
  const filePath = `/uploads/${req.file.filename}`;
  const originalFileName = req.file.originalname || 'unknown';
  const fileExt = path.extname(req.file.originalname).replace('.', '') || 'file';
  const fileType = fileExt.toUpperCase();
  const fileSize = req.file.size || 0;

  const isApproved = req.user.role === 'admin' ? 1 : 1; // Auto-approve all uploads for now
  const [result] = await pool.query(
    `INSERT INTO course_materials (
      course_id, uploader_id, title, slug, description,
      file_path, original_file_name, file_type, file_size, material_type, is_public, is_approved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `,
    [
      courseId,
      req.user.id,
      title,
      slug,
      description || null,
      filePath,
      originalFileName || null,
      fileType || null,
      fileSize || null,
      materialType || 'material',
      isApproved,
    ]
  );

  // Fetch the created material to return it
  const [createdRows] = await pool.query(
    `SELECT ${materialColumns}
     FROM course_materials cm
     INNER JOIN courses c ON c.id = cm.course_id
     INNER JOIN users u ON u.id = cm.uploader_id
     WHERE cm.id = ?`,
    [result.insertId]
  );

  const created = createdRows[0];
  if (!created) {
    throw new ApiError(500, 'Failed to retrieve created material');
  }
  
  res.status(201).json({
    material: {
      id: created.id,
      course_id: created.course_id,
      uploader_id: created.uploader_id,
      title: created.title,
      description: created.description || '',
      fileUrl: created.file_path || null,
      file_path: created.file_path || null,
      originalFileName: created.original_file_name || null,
      fileType: created.file_type || null,
      fileSize: created.file_size || 0,
      materialType: created.material_type || 'material',
      rating: created.rating_avg || 0,
      ratingCount: created.rating_count || 0,
      downloads: created.downloads || 0,
      uploadedAt: created.uploaded_at,
      courseCode: created.course_code || null,
      courseName: created.course_name || null,
      uploaderName: created.uploader_name || 'Unknown',
    },
    materialId: result.insertId,
    requiresReview: false,
  });
});

const updateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existingRows] = await pool.query(
    'SELECT id, uploader_id FROM course_materials WHERE id = ? LIMIT 1',
    [id]
  );
  const existing = existingRows[0];
  if (!existing) {
    throw new ApiError(404, 'Material not found');
  }
  if (req.user.role !== 'admin' && existing.uploader_id !== req.user.id) {
    throw new ApiError(403, 'Not allowed to update this material');
  }

  const fields = ['title', 'description', 'material_type', 'is_public', 'is_approved'];
  const updates = [];
  const params = [];

  fields.forEach((field) => {
    if (typeof req.body[field] !== 'undefined') {
      updates.push(`${field === 'material_type' ? 'material_type' : field} = ?`);
      params.push(req.body[field]);
    }
  });

  if (!updates.length) {
    return res.json({ message: 'Nothing to update' });
  }

  params.push(id);
  const [result] = await pool.query(
    `UPDATE course_materials SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  if (!result.affectedRows) {
    throw new ApiError(500, 'Update failed');
  }

  res.json({ message: 'Material updated' });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT uploader_id FROM course_materials WHERE id = ?', [id]);
  const material = rows[0];
  if (!material) {
    throw new ApiError(404, 'Material not found');
  }
  if (req.user.role !== 'admin' && material.uploader_id !== req.user.id) {
    throw new ApiError(403, 'Not allowed to delete this material');
  }

  await pool.query('DELETE FROM course_materials WHERE id = ?', [id]);
  res.json({ message: 'Material removed' });
});

const recordDownload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE course_materials SET downloads = downloads + 1 WHERE id = ?', [id]);
  await pool.query(
    'INSERT INTO material_downloads (material_id, user_id, ip_address) VALUES (?, ?, ?)',
    [id, req.user?.id || null, req.ip]
  );
  res.json({ message: 'Download recorded' });
});

const rateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  await pool.query(
    `INSERT INTO material_reviews (material_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
    [id, req.user.id, rating, comment || null]
  );

  await pool.query(
    `UPDATE course_materials cm
     SET rating_avg = (
         SELECT AVG(rating) FROM material_reviews WHERE material_id = cm.id
       ),
       rating_count = (
         SELECT COUNT(*) FROM material_reviews WHERE material_id = cm.id
       )
     WHERE cm.id = ?`,
    [id]
  );

  res.json({ message: 'Rating saved' });
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const action = req.body.action || 'toggle';
  const [existing] = await pool.query(
    'SELECT 1 FROM favorites WHERE user_id = ? AND material_id = ?',
    [req.user.id, id]
  );
  const hasFavorite = existing.length > 0;

  if ((action === 'add' || action === 'toggle') && !hasFavorite) {
    await pool.query('INSERT INTO favorites (user_id, material_id) VALUES (?, ?)', [
      req.user.id,
      id,
    ]);
    return res.json({ message: 'Bookmarked' });
  }

  if ((action === 'remove' || action === 'toggle') && hasFavorite) {
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND material_id = ?', [
      req.user.id,
      id,
    ]);
    return res.json({ message: 'Bookmark removed' });
  }

  return res.json({ message: 'No changes applied' });
});

module.exports = {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  rateMaterial,
  recordDownload,
  toggleBookmark,
};

