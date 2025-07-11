const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { sendNotification } = require('../middleware/socket');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all comments for a post (with nested replies)
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { postId: req.params.postId, parentId: null },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'avatar']
          }],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a comment or reply
router.post('/', auth, [
  body('postId').isInt().withMessage('postId is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('parentId').optional().isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { postId, content, parentId } = req.body;
    
    // Create the comment
    const comment = await Comment.create({
      postId,
      content,
      parentId: parentId || null,
      userId: req.user.id
    });

    // Get the post author
    const post = await Post.findByPk(postId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name']
      }]
    });

    // Create notification for post author (if commenter is not the post author)
    if (post.userId !== req.user.id) {
      const notification = await Notification.create({
        type: 'comment',
        content: `${req.user.name} commented on your post`,
        recipientId: post.userId,
        senderId: req.user.id,
        relatedModelId: comment.id,
        relatedModelType: 'Comment'
      });

      await sendNotification(post.userId, notification);
    }

    // If this is a reply, notify the parent comment author
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }]
      });

      if (parentComment && parentComment.userId !== req.user.id) {
        const notification = await Notification.create({
          type: 'comment',
          content: `${req.user.name} replied to your comment`,
          recipientId: parentComment.userId,
          senderId: req.user.id,
          relatedModelId: comment.id,
          relatedModelType: 'Comment'
        });

        await sendNotification(parentComment.userId, notification);
      }
    }

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }]
    });
    res.json(commentWithAuthor);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment (auth + ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 