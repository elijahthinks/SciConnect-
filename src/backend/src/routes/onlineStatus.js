const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const onlineStatusService = require('../utils/onlineStatus');
const User = require('../models/User');

// Get online status for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isOnline = await onlineStatusService.isUserOnline(userId);
    const lastActive = await onlineStatusService.getUserLastActive(userId);

    res.json({
      userId: parseInt(userId),
      isOnline,
      lastActive: lastActive ? new Date(lastActive) : user.lastActive
    });
  } catch (error) {
    console.error('Error getting user online status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get online status for multiple users
router.post('/users', auth, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    // Validate that all users exist
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'lastActive']
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({ error: 'Some users not found' });
    }

    const onlineStatuses = await onlineStatusService.getUsersOnlineStatus(userIds);
    
    // Combine with database lastActive times
    const results = onlineStatuses.map(status => {
      const user = users.find(u => u.id === status.userId);
      return {
        userId: status.userId,
        isOnline: status.isOnline,
        lastActive: user.lastActive
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Error getting users online status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all online users
router.get('/online', auth, async (req, res) => {
  try {
    const onlineUserIds = await onlineStatusService.getOnlineUsers();
    
    if (onlineUserIds.length === 0) {
      return res.json([]);
    }

    const onlineUsers = await User.findAll({
      where: { id: onlineUserIds },
      attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'lastActive']
    });

    res.json(onlineUsers);
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's online status
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const isOnline = await onlineStatusService.isUserOnline(userId);
    const lastActive = await onlineStatusService.getUserLastActive(userId);

    res.json({
      userId,
      isOnline,
      lastActive: lastActive ? new Date(lastActive) : req.user.lastActive
    });
  } catch (error) {
    console.error('Error getting current user online status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 