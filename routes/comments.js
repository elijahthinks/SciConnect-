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
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          }],
          order: [['createdAt', 'ASC']]
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Manually construct names for all comments and replies
    comments.forEach(comment => {
      if (comment.author) {
        comment.author.dataValues.name = `${comment.author.firstName} ${comment.author.lastName}`;
      }
      if (comment.replies) {
        comment.replies.forEach(reply => {
          if (reply.author) {
            reply.author.dataValues.name = `${reply.author.firstName} ${reply.author.lastName}`;
          }
        });
      }
    });
    
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a comment or reply
router.post('/', auth, [
  body('postId').custom((value) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      throw new Error('postId must be a valid number');
    }
    return true;
  }).withMessage('postId is required and must be a valid number'),
  body('content').notEmpty().withMessage('Content is required'),
  body('parentId').optional().custom((value) => {
    if (value !== null && value !== undefined) {
      const num = parseInt(value);
      if (isNaN(num)) {
        throw new Error('parentId must be a valid number');
      }
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { postId, content, parentId } = req.body;
    
    // Convert to numbers to ensure proper types
    const numericPostId = parseInt(postId);
    const numericParentId = parentId ? parseInt(parentId) : null;
    
    console.log('Creating comment with data:', { 
      postId: numericPostId, 
      content, 
      parentId: numericParentId, 
      userId: req.user.id 
    });
    
    // Create the comment
    const comment = await Comment.create({
      postId: numericPostId,
      content,
      parentId: numericParentId,
      userId: req.user.id
    });

    console.log('Comment created successfully:', comment.id);

    // Get the post author
    const post = await Post.findByPk(numericPostId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    if (!post) {
      console.error('Post not found:', numericPostId);
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create notification for post author (if commenter is not the post author)
    if (post.userId !== req.user.id) {
      const userName = `${req.user.firstName} ${req.user.lastName}`;
      const notification = await Notification.create({
        type: 'comment',
        content: `${userName} commented on your post`,
        recipientId: post.userId,
        senderId: req.user.id,
        relatedModelId: comment.id,
        relatedModelType: 'Comment'
      });

      await sendNotification(post.userId, notification);
    }

    // If this is a reply, notify the parent comment author
    if (numericParentId) {
      const parentComment = await Comment.findByPk(numericParentId, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName']
        }]
      });

      if (parentComment && parentComment.userId !== req.user.id) {
        const userName = `${req.user.firstName} ${req.user.lastName}`;
        const notification = await Notification.create({
          type: 'comment',
          content: `${userName} replied to your comment`,
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
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }]
    });
    
    // Manually construct the name since virtual fields don't work with specific attributes
    if (commentWithAuthor && commentWithAuthor.author) {
      commentWithAuthor.author.dataValues.name = `${commentWithAuthor.author.firstName} ${commentWithAuthor.author.lastName}`;
    }
    
    console.log('Returning comment with author:', commentWithAuthor.id);
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