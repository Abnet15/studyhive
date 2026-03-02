const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const summary = asyncHandler(async (_req, res) => {
  const [[stats]] = await pool.query(
    `SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM course_materials) AS total_materials,
        (SELECT IFNULL(SUM(downloads),0) FROM course_materials) AS total_downloads,
        (SELECT COUNT(*) FROM course_materials WHERE material_type = 'exam') AS total_exams
     FROM dual`
  );

  const [recentMaterials] = await pool.query(
    `SELECT cm.id, cm.title, cm.material_type, cm.downloads, cm.uploaded_at, c.course_code
     FROM course_materials cm
     INNER JOIN courses c ON c.id = cm.course_id
     ORDER BY cm.uploaded_at DESC
     LIMIT 5`
  );

  const [topContributors] = await pool.query(
    `SELECT u.full_name, COUNT(cm.id) AS uploads, IFNULL(SUM(cm.downloads), 0) AS downloads
     FROM users u
     INNER JOIN course_materials cm ON cm.uploader_id = u.id
     GROUP BY u.id
     ORDER BY downloads DESC
     LIMIT 5`
  );

  res.json({
    stats: {
      totalUsers: stats.total_users,
      totalMaterials: stats.total_materials,
      totalDownloads: stats.total_downloads,
      totalExams: stats.total_exams,
    },
    recentMaterials,
    topContributors,
  });
});

module.exports = {
  summary,
};

