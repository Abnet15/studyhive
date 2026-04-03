const Badge = require('../models/Badge.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listBadges = asyncHandler(async (_req, res) => {
  const badges = await Badge.find();
  res.json({
    badges: badges.map((badge) => ({
      id: badge._id,
      name: badge.name,
      description: badge.description,
      icon: badge.iconUrl,
      criteria: badge.criteria,
    })),
  });
});

const awardBadge = asyncHandler(async (req, res) => {
  const { badgeId, userId } = req.body;

  const badge = await Badge.findById(badgeId);
  if (!badge) {
    throw new ApiError(404, 'Badge not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Add user to badge if not already added
  if (!badge.users.includes(userId)) {
    badge.users.push(userId);
    await badge.save();
  }

  res.json({ message: 'Badge awarded' });
});

module.exports = {
  listBadges,
  awardBadge,
};
