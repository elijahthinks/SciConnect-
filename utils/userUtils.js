const UserRelationship = require('../models/UserRelationship');

const BASIC_USER_ATTRIBUTES = ['id', 'name', 'avatar', 'institution', 'position'];
const PROFILE_ATTRIBUTES = [
  'id', 'name', 'email', 'avatar', 'bio',
  'institution', 'position', 'department',
  'education', 'publications', 'researchInterests',
  'socialLinks', 'isVerified', 'lastActive',
  'createdAt'
];

async function getFollowStats(userId) {
  const followerCount = await UserRelationship.count({
    where: { followingId: userId, status: 'accepted' }
  });

  const followingCount = await UserRelationship.count({
    where: { followerId: userId, status: 'accepted' }
  });

  return { followerCount, followingCount };
}

module.exports = {
  BASIC_USER_ATTRIBUTES,
  PROFILE_ATTRIBUTES,
  getFollowStats
};
