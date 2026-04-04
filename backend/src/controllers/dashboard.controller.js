const Material = require('../models/Material.model');
const User = require('../models/User.model');
const ExamScore = require('../models/ExamScore.model');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (_req, res) => {
  const totalUsers = await User.countDocuments();
  const totalMaterials = await Material.countDocuments();
  
  const downloadsAgg = await Material.aggregate([
    { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
  ]);
  const totalDownloads = downloadsAgg[0]?.totalDownloads || 0;
  
  const totalExams = await Material.countDocuments({ materialType: 'exam' });

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

  const topContributors = await Material.aggregate([
    { $group: { _id: '$uploader_id', uploads: { $sum: 1 } } },
    { $sort: { uploads: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { _id: 0, id: '$_id', name: '$user.fullName', email: '$user.email', uploads: 1 } }
  ]);

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

const studentSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userMaterials = await Material.find({ uploader_id: userId });
  const totalUploads = userMaterials.length;
  const totalDownloads = userMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  
  const latestExam = await ExamScore.findOne({ user_id: userId }).sort({ createdAt: -1 });
  const exitReadiness = latestExam && latestExam.totalMaxScore > 0 
    ? Math.round((latestExam.totalScore / latestExam.totalMaxScore) * 100)
    : 0; // Default to 0 if no exams taken

  const avgRating = userMaterials.length > 0
    ? (userMaterials.reduce((sum, m) => sum + (m.rating || 0), 0) / userMaterials.length).toFixed(1)
    : '0.0';

  res.json({
    totalUploads,
    totalDownloads,
    exitReadiness,
    avgRating
  });
});

module.exports = {
  summary,
  studentSummary,
};
