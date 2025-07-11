const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const UserRelationship = require('../models/UserRelationship');
const Notification = require('../models/Notification');
const { sendNotification } = require('../middleware/socket');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{
        model: User,
        as: 'followers',
        attributes: ['id', 'name', 'avatar', 'institution', 'position'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users being followed by user
router.get('/:userId/following', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'name', 'avatar', 'institution', 'position'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    if (req.user.id === parseInt(req.params.userId)) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findByPk(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [relationship, created] = await UserRelationship.findOrCreate({
      where: {
        followerId: req.user.id,
        followingId: targetUser.id
      },
      defaults: {
        status: 'accepted'
      }
    });

    if (!created && relationship.status === 'blocked') {
      return res.status(403).json({ message: 'Unable to follow this user' });
    }

    if (!created) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create notification
    const notification = await Notification.create({
      type: 'follow',
      content: `${req.user.name} started following you`,
      recipientId: targetUser.id,
      senderId: req.user.id
    });

    // Send real-time notification
    await sendNotification(targetUser.id, notification);

    // Get updated follower/following counts
    const followerCount = await UserRelationship.count({
      where: { followingId: targetUser.id, status: 'accepted' }
    });

    const followingCount = await UserRelationship.count({
      where: { followerId: req.user.id, status: 'accepted' }
    });

    res.json({
      message: `Now following ${targetUser.name}`,
      followerCount,
      followingCount
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.delete('/unfollow/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await UserRelationship.destroy({
      where: {
        followerId: req.user.id,
        followingId: targetUser.id
      }
    });

    if (!deleted) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Get updated follower/following counts
    const followerCount = await UserRelationship.count({
      where: { followingId: targetUser.id, status: 'accepted' }
    });

    const followingCount = await UserRelationship.count({
      where: { followerId: req.user.id, status: 'accepted' }
    });

    res.json({
      message: `Unfollowed ${targetUser.name}`,
      followerCount,
      followingCount
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get follow status and stats for a user
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    
    // Get follower count
    const followerCount = await UserRelationship.count({
      where: { followingId: targetUserId, status: 'accepted' }
    });

    // Get following count
    const followingCount = await UserRelationship.count({
      where: { followerId: targetUserId, status: 'accepted' }
    });

    // Check if current user is following the target user
    const isFollowing = await UserRelationship.findOne({
      where: {
        followerId: req.user.id,
        followingId: targetUserId,
        status: 'accepted'
      }
    });

    res.json({
      followerCount,
      followingCount,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Error getting follow status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users to follow
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get IDs of users already being followed
    const following = await UserRelationship.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId']
    });
    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Add current user's ID to exclude

    const whereClause = {
      id: { [Op.notIn]: followingIds }
    };

    if (q) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { institution: { [Op.iLike]: `%${q}%` } },
        { department: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'avatar', 'institution', 'position', 'department'],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      users: users.rows,
      total: users.count,
      page,
      totalPages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    console.error('Error getting user suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 