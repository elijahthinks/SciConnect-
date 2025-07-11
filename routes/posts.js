const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const UserRelationship = require('../models/UserRelationship');
const Notification = require('../models/Notification');
const { sendNotification } = require('../middleware/socket');
const auth = require('../middleware/auth');
const { mediaUpload, processMedia } = require('../middleware/upload');

const router = express.Router();

// Upload media for post
router.post('/upload/media', auth, mediaUpload, processMedia, async (req, res) => {
  try {
    if (!req.processedMedia) {
      return res.status(400).json({ message: 'No media files uploaded' });
    }

    const urls = req.processedMedia.map(file => file.url);
    const mediaType = req.processedMedia[0].type; // Use the type of the first file

    res.json({ urls, mediaType });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ message: 'Failed to process media files' });
  }
});

// Get popular tags
router.get('/tags/popular', async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ['tags'],
      where: {
        tags: {
          [Op.not]: '[]'
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    // Count tag occurrences
    const tagCounts = {};
    posts.forEach(post => {
      const tags = post.tags || [];
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort tags by count and get top 20
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag);

    res.json(popularTags);
  } catch (err) {
    console.error('Failed to get popular tags:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (feed) with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const filter = req.query.filter || 'all';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const userId = req.user?.id;

    // Base query
    const query = {
      where: {},
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    };

    // Apply filters
    if (userId) {
      switch (filter) {
        case 'following':
          const following = await UserRelationship.findAll({
            where: { followerId: userId },
            attributes: ['followingId']
          });
          query.where.userId = {
            [Op.in]: following.map(f => f.followingId)
          };
          break;
        
        case 'connections':
          const connections = await UserRelationship.findAll({
            where: {
              [Op.or]: [
                { followerId: userId },
                { followingId: userId }
              ]
            },
            attributes: ['followerId', 'followingId']
          });
          const connectionIds = [...new Set(
            connections.map(c => c.followerId === userId ? c.followingId : c.followerId)
          )];
          query.where.userId = {
            [Op.in]: connectionIds
          };
          break;
      }
    }

    // Apply tag filter
    if (tags.length > 0) {
      query.where = {
        ...query.where,
        tags: {
          [Op.overlap]: tags
        }
      };
    }

    const posts = await Post.findAll(query);
    
    res.json(posts);
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post (requires auth)
router.post('/', auth, [
  body('content').optional().isString(),
  body('media').optional().isArray(),
  body('mediaType').optional().isIn(['image', 'video', 'document']),
  body('tags').optional().isArray(),
  body('visibility').optional().isIn(['public', 'connections', 'private'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, media = [], mediaType, tags = [], visibility = 'public' } = req.body;
    
    if (!content && media.length === 0) {
      return res.status(400).json({ message: 'Post must have content or media' });
    }

    const post = await Post.create({
      content,
      media,
      mediaType,
      tags,
      visibility,
      userId: req.user.id
    });

    // Fetch the post with author info
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    res.json(postWithAuthor);
  } catch (err) {
    console.error('Failed to create post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post (requires auth and ownership)
router.put('/:id', auth, [
  body('content').optional().isString(),
  body('media').optional().isArray(),
  body('mediaType').optional().isIn(['image', 'video', 'document']),
  body('tags').optional().isArray(),
  body('visibility').optional().isIn(['public', 'connections', 'private'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Post.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content, media, mediaType, tags, visibility } = req.body;
    
    if (content !== undefined) post.content = content;
    if (media !== undefined) post.media = media;
    if (mediaType !== undefined) post.mediaType = mediaType;
    if (tags !== undefined) post.tags = tags;
    if (visibility !== undefined) post.visibility = visibility;

    await post.save();

    // Fetch updated post with author info
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar', 'email']
        }
      ]
    });

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post (requires auth and ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add like to post
    if (!post.likes) post.likes = [];
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes = [...post.likes, req.user.id];
    await post.save();

    // Create notification (only if the post author is not the liker)
    if (post.userId !== req.user.id) {
      const notification = await Notification.create({
        type: 'like',
        content: `${req.user.name} liked your post`,
        recipientId: post.userId,
        senderId: req.user.id,
        relatedModelId: post.id,
        relatedModelType: 'Post'
      });

      // Send real-time notification
      await sendNotification(post.userId, notification);
    }

    res.json(post);
  } catch (err) {
    console.error('Failed to like post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 