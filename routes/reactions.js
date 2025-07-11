const express = require('express');
const { body, validationResult } = require('express-validator');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../middleware/socket');
const auth = require('../middleware/auth');

const router = express.Router();

// Get reactions for a target (post or comment)
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    
    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    const reactions = await Reaction.findAll({
      where: { targetType, targetId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Group reactions by type
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.type]) {
        acc[reaction.type] = [];
      }
      acc[reaction.type].push(reaction);
      return acc;
    }, {});

    res.json(groupedReactions);
  } catch (err) {
    console.error('Error fetching reactions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or update reaction
router.post('/:targetType/:targetId', auth, [
  body('type').isIn(['like', 'heart', 'celebrate', 'insightful', 'curious']).withMessage('Invalid reaction type')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { targetType, targetId } = req.params;
    const { type } = req.body;
    
    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    // Check if target exists
    const Target = targetType === 'post' ? Post : Comment;
    const target = await Target.findByPk(targetId, {
      include: [{
        model: User,
        as: targetType === 'post' ? 'author' : 'author',
        attributes: ['id', 'name']
      }]
    });

    if (!target) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    // Find existing reaction
    let reaction = await Reaction.findOne({
      where: {
        userId: req.user.id,
        targetType,
        targetId
      }
    });

    if (reaction) {
      // If same type, remove reaction (toggle off)
      if (reaction.type === type) {
        await reaction.destroy();
        return res.json({ message: 'Reaction removed' });
      }
      // If different type, update reaction
      reaction.type = type;
      await reaction.save();
    } else {
      // Create new reaction
      reaction = await Reaction.create({
        type,
        targetType,
        targetId,
        userId: req.user.id
      });

      // Create notification for target author (if not self)
      if (target.author.id !== req.user.id) {
        const notification = await Notification.create({
          type: 'reaction',
          content: `${req.user.name} reacted to your ${targetType}`,
          recipientId: target.author.id,
          senderId: req.user.id,
          relatedModelId: targetId,
          relatedModelType: targetType
        });

        await sendNotification(target.author.id, notification);
      }
    }

    // Get updated reaction with user info
    const updatedReaction = await Reaction.findByPk(reaction.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar']
      }]
    });

    res.json(updatedReaction);
  } catch (err) {
    console.error('Error handling reaction:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 