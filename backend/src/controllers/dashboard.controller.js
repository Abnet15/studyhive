const Material = require('../models/Material.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (_req, res) => {
  const totalUsers = await User.countDocuments();
  const totalMaterials = await Material.countDocuments();
  
  // Note: we'd need to add downloads tracked by a separate mechanism if we want total_downloads exactly
  const totalDownloads = 0; 
  
  const totalExams = await Material.countDocuments({ fileType: 'PDF' }); // Approximation or extend schema

  const recentMaterials = await Material.find()
    .populate('course_id')
    .sort({ createdAt: -1 })
    .limit(5);

  const stats = {
    totalUsers,
    totalMaterials,
    totalDownloads,
    totalExams,
  };

  const topContributors = []; // complex aggregation can be done here

  res.json({
    stats,
    recentMaterials: recentMaterials.map(m => ({
      id: m._id,
      title: m.title,
      uploaded_at: m.createdAt,
      course_code: m.course_id ? m.course_id.code : null,
      aiSummary: m.aiSummary || null
    })),
    topContributors,
  });
});

module.exports = {
  summary,
};
