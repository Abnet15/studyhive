const path = require('path');
const slugify = require('slugify');
const Material = require('../models/Material.model');
const Review = require('../models/Review.model');
const Bookmark = require('../models/Bookmark.model');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateSmartSummary } = require('../utils/ai');

/* ── Helpers ──────────────────────────────────────────────── */

const buildSlug = async (title) => {
  const base = slugify(title, { lower: true, strict: true }) || `material-${Date.now()}`;
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await Material.findOne({ slug });
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
};

const mapMaterial = (item, extras = {}) => ({
  id: item._id,
  course_id: item.course_id?._id || item.course_id,
  uploader_id: item.uploader_id?._id || item.uploader_id,
  title: item.title,
  slug: item.slug,
  description: item.description || '',
  fileUrl: item.fileUrl || null,
  file_path: item.fileUrl || null,
  fileType: item.fileType || null,
  fileSize: item.fileSize || 0,
  downloads: item.downloads || 0,
  uploadedAt: item.createdAt,
  courseCode: item.course_id?.code || null,
  courseName: item.course_id?.title || null,
  uploaderName: item.uploader_id?.fullName || 'Unknown',
  // Askuala AI
  aiSummary: item.aiSummary || null,
  aiKeyTerms: item.aiKeyTerms || [],
  aiQuiz: item.aiQuiz || [],
  // Extras (rating, bookmarked)
  ...extras,
});

/* ── Controllers ──────────────────────────────────────────── */

const listMaterials = asyncHandler(async (req, res) => {
  const { courseId, search, limit = 30, sort = 'recent' } = req.query;
  const query = {};

  if (courseId) query.course_id = courseId;
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'popular') sortOption = { downloads: -1 };

  const materials = await Material.find(query)
    .populate('course_id')
    .populate('uploader_id', 'fullName email')
    .sort(sortOption)
    .limit(Number(limit));

  // Batch-fetch average ratings
  const materialIds = materials.map((m) => m._id);
  const ratingAgg = await Review.aggregate([
    { $match: { material_id: { $in: materialIds } } },
    { $group: { _id: '$material_id', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const ratingMap = {};
  ratingAgg.forEach((r) => { ratingMap[r._id.toString()] = { avg: r.avg, count: r.count }; });

  res.json({
    materials: materials.map((m) => {
      const r = ratingMap[m._id.toString()] || { avg: 0, count: 0 };
      return mapMaterial(m, { rating: r.avg, ratingCount: r.count });
    }),
  });
});

const getMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await Material.findById(id)
    .populate('course_id')
    .populate('uploader_id', 'fullName email');

  if (!material) throw new ApiError(404, 'Material not found');

  // Fetch reviews
  const reviews = await Review.find({ material_id: id })
    .populate('user_id', 'fullName')
    .sort({ createdAt: -1 });

  const ratingAgg = await Review.aggregate([
    { $match: { material_id: material._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const stats = ratingAgg[0] || { avg: 0, count: 0 };

  // Check if current user bookmarked
  let bookmarked = false;
  if (req.user) {
    const bm = await Bookmark.findOne({ user_id: req.user.id, material_id: id });
    bookmarked = !!bm;
  }

  res.json({
    material: mapMaterial(material, {
      rating: stats.avg,
      ratingCount: stats.count,
      bookmarked,
      reviews: reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user_id?.fullName || 'Anonymous',
        createdAt: r.createdAt,
      })),
    }),
  });
});

const createMaterial = asyncHandler(async (req, res) => {
  const { title, description, courseId } = req.body;

  if (!req.file && !req.body.fileUrl) {
    throw new ApiError(400, 'A file upload or fileUrl is required');
  }
  if (!req.file) {
    throw new ApiError(400, 'File upload is required');
  }

  const slug = await buildSlug(title);
  const fileUrl = req.file.path; // Cloudinary secure URL
  const originalName = req.file.originalname || 'unknown';
  const fileExt = path.extname(originalName).replace('.', '') || 'file';
  const fileType = fileExt.toUpperCase();
  const fileSize = req.file.size || 0;

  // Askuala AI — generate Smart Summary (never crashes upload)
  let aiData = { aiSummary: null, aiKeyTerms: [], aiQuiz: [] };
  try {
    aiData = await generateSmartSummary(fileUrl, title);
  } catch (err) {
    console.error('[createMaterial] AI generation failed, saving without AI data:', err.message);
  }

  const material = await Material.create({
    title,
    slug,
    description: description || null,
    fileUrl,
    fileType,
    fileSize,
    uploader_id: req.user.id,
    course_id: courseId,
    ...aiData,
  });

  const populated = await Material.findById(material._id)
    .populate('course_id')
    .populate('uploader_id', 'fullName email');

  res.status(201).json({
    material: mapMaterial(populated),
    materialId: material._id,
    requiresReview: false,
  });
});

const updateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await Material.findById(id);
  if (!material) throw new ApiError(404, 'Material not found');

  if (req.user.role !== 'admin' && material.uploader_id.toString() !== req.user.id.toString()) {
    throw new ApiError(403, 'Not allowed to update this material');
  }

  const { title, description } = req.body;
  if (title) material.title = title;
  if (typeof description !== 'undefined') material.description = description;

  await material.save();
  res.json({ message: 'Material updated' });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const material = await Material.findById(id);
  if (!material) throw new ApiError(404, 'Material not found');

  if (req.user.role !== 'admin' && material.uploader_id.toString() !== req.user.id.toString()) {
    throw new ApiError(403, 'Not allowed to delete this material');
  }

  // Delete file from Cloudinary
  if (material.fileUrl && material.fileUrl.includes('cloudinary')) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = material.fileUrl.split('/');
      const fileWithExt = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (err) {
      console.warn('[deleteMaterial] Cloudinary cleanup failed:', err.message);
    }
  }

  // Cascade delete reviews and bookmarks
  await Review.deleteMany({ material_id: id });
  await Bookmark.deleteMany({ material_id: id });
  await Material.findByIdAndDelete(id);

  res.json({ message: 'Material removed' });
});

/* ── Downloads / Ratings / Bookmarks (FULLY IMPLEMENTED) ── */

const recordDownload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const material = await Material.findByIdAndUpdate(
    id,
    { $inc: { downloads: 1 } },
    { new: true }
  );
  if (!material) throw new ApiError(404, 'Material not found');
  res.json({ message: 'Download recorded', downloads: material.downloads });
});

const rateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const material = await Material.findById(id);
  if (!material) throw new ApiError(404, 'Material not found');

  // Upsert: one review per user per material
  await Review.findOneAndUpdate(
    { material_id: id, user_id: req.user.id },
    { rating, comment: comment || '' },
    { upsert: true, new: true }
  );

  // Recalculate aggregate
  const agg = await Review.aggregate([
    { $match: { material_id: material._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const stats = agg[0] || { avg: 0, count: 0 };

  res.json({
    message: 'Rating saved',
    rating: stats.avg,
    ratingCount: stats.count,
  });
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const action = req.body.action || 'toggle';

  const existing = await Bookmark.findOne({ user_id: req.user.id, material_id: id });

  if ((action === 'add' || action === 'toggle') && !existing) {
    await Bookmark.create({ user_id: req.user.id, material_id: id });
    return res.json({ message: 'Bookmarked', bookmarked: true });
  }

  if ((action === 'remove' || action === 'toggle') && existing) {
    await Bookmark.findByIdAndDelete(existing._id);
    return res.json({ message: 'Bookmark removed', bookmarked: false });
  }

  return res.json({ message: 'No changes applied', bookmarked: !!existing });
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
