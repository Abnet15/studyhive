const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listBadges = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT id, code, name, description, icon, threshold_value FROM badges');
  res.json({
    badges: rows.map((badge) => ({
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      threshold: badge.threshold_value,
    })),
  });
});

const awardBadge = asyncHandler(async (req, res) => {
  const { badgeId, userId } = req.body;

  const [badgeRows] = await pool.query('SELECT id FROM badges WHERE id = ? LIMIT 1', [badgeId]);
  if (!badgeRows.length) {
    throw new ApiError(404, 'Badge not found');
  }
  const [userRows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!userRows.length) {
    throw new ApiError(404, 'User not found');
  }

  await pool.query(
    `INSERT INTO user_badges (user_id, badge_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE awarded_at = NOW()`,
    [userId, badgeId]
  );

  res.json({ message: 'Badge awarded' });
});

module.exports = {
  listBadges,
  awardBadge,
};

