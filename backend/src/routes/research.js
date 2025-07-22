const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ResearchPost = require('../models/ResearchPost');
const FactCheck = require('../models/FactCheck');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all research posts with filters
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      researchType, 
      factCheckStatus, 
      openAccess, 
      tags,
      userId,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters
    if (researchType) whereClause.researchType = researchType;
    if (factCheckStatus) whereClause.factCheckStatus = factCheckStatus;
    if (openAccess !== undefined) whereClause.openAccess = openAccess === 'true';
    if (userId) whereClause.userId = userId;
    if (search) {
      whereClause[Op.or] = [
        { content: { [Op.iLike]: `%${search}%` } },
        { methodology: { [Op.iLike]: `%${search}%` } },
        { results: { [Op.iLike]: `%${search}%` } },
        { conclusions: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const posts = await ResearchPost.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
        },
        {
          model: FactCheck,
          as: 'factChecks',
          where: { status: 'approved' },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'isVerified']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Filter by tags if provided
    let filteredPosts = posts.rows;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredPosts = posts.rows.filter(post => {
        const postTags = post.tags || [];
        return tagArray.some(tag => postTags.includes(tag));
      });
    }

    res.json({
      posts: filteredPosts,
      total: posts.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(posts.count / limit)
    });
  } catch (error) {
    console.error('Error fetching research posts:', error);
    res.status(500).json({ message: 'Failed to fetch research posts' });
  }
});

// Create a new research post
router.post('/', auth, async (req, res) => {
  try {
    const {
      content,
      media,
      mediaType,
      visibility,
      tags,
      researchType,
      methodology,
      results,
      conclusions,
      citations,
      doi,
      preprintUrl,
      openAccess,
      funding,
      conflictsOfInterest,
      collaborationStatus
    } = req.body;

    const post = await ResearchPost.create({
      userId: req.user.id,
      content,
      media: media || [],
      mediaType,
      visibility: visibility || 'public',
      tags: tags || [],
      researchType: researchType || 'results',
      methodology,
      results,
      conclusions,
      citations: citations || [],
      doi,
      preprintUrl,
      openAccess: openAccess !== false, // Default to true
      funding,
      conflictsOfInterest,
      collaborationStatus: collaborationStatus || 'open'
    });

    const postWithAuthor = await ResearchPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
        }
      ]
    });

    res.status(201).json(postWithAuthor);
  } catch (error) {
    console.error('Error creating research post:', error);
    res.status(500).json({ message: 'Failed to create research post' });
  }
});

// Get a specific research post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await ResearchPost.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
        },
        {
          model: FactCheck,
          as: 'factChecks',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'isVerified']
            }
          ],
          order: [['voteScore', 'DESC'], ['createdAt', 'DESC']]
        },
        {
          model: Collaboration,
          as: 'collaborations',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Research post not found' });
    }

    // Increment view count
    await post.increment('views');

    res.json(post);
  } catch (error) {
    console.error('Error fetching research post:', error);
    res.status(500).json({ message: 'Failed to fetch research post' });
  }
});

// Update a research post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await ResearchPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Research post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    await post.update(req.body);

    const updatedPost = await ResearchPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
        }
      ]
    });

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating research post:', error);
    res.status(500).json({ message: 'Failed to update research post' });
  }
});

// Delete a research post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await ResearchPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Research post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();
    res.json({ message: 'Research post deleted successfully' });
  } catch (error) {
    console.error('Error deleting research post:', error);
    res.status(500).json({ message: 'Failed to delete research post' });
  }
});

// Like/unlike a research post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await ResearchPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Research post not found' });
    }

    const likes = post.likes || [];
    const userLiked = likes.includes(req.user.id);

    if (userLiked) {
      // Unlike
      const updatedLikes = likes.filter(id => id !== req.user.id);
      await post.update({ likes: updatedLikes });
    } else {
      // Like
      const updatedLikes = [...likes, req.user.id];
      await post.update({ likes: updatedLikes });
    }

    res.json({ 
      liked: !userLiked, 
      likesCount: userLiked ? likes.length - 1 : likes.length + 1 
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// Get fact checks for a research post
router.get('/:id/fact-checks', auth, async (req, res) => {
  try {
    const factChecks = await FactCheck.findAll({
      where: { researchPostId: req.params.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'isVerified']
        }
      ],
      order: [['voteScore', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(factChecks);
  } catch (error) {
    console.error('Error fetching fact checks:', error);
    res.status(500).json({ message: 'Failed to fetch fact checks' });
  }
});

// Create a fact check
router.post('/:id/fact-checks', auth, async (req, res) => {
  try {
    const { type, content, severity, evidence, citations } = req.body;

    const factCheck = await FactCheck.create({
      researchPostId: req.params.id,
      userId: req.user.id,
      type,
      content,
      severity: severity || 'medium',
      evidence,
      citations: citations || []
    });

    const factCheckWithAuthor = await FactCheck.findByPk(factCheck.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'isVerified']
        }
      ]
    });

    res.status(201).json(factCheckWithAuthor);
  } catch (error) {
    console.error('Error creating fact check:', error);
    res.status(500).json({ message: 'Failed to create fact check' });
  }
});

// Vote on a fact check
router.post('/fact-checks/:factCheckId/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const factCheck = await FactCheck.findByPk(req.params.factCheckId);
    
    if (!factCheck) {
      return res.status(404).json({ message: 'Fact check not found' });
    }

    const votes = factCheck.votes || [];
    const existingVoteIndex = votes.findIndex(v => v.userId === req.user.id);

    if (existingVoteIndex >= 0) {
      // Update existing vote
      votes[existingVoteIndex].vote = vote;
    } else {
      // Add new vote
      votes.push({ userId: req.user.id, vote });
    }

    // Calculate vote score
    const voteScore = votes.reduce((score, v) => {
      return score + (v.vote === 'up' ? 1 : -1);
    }, 0);

    await factCheck.update({ votes, voteScore });

    res.json({ voteScore });
  } catch (error) {
    console.error('Error voting on fact check:', error);
    res.status(500).json({ message: 'Failed to vote on fact check' });
  }
});

// Get collaborations for a research post
router.get('/:id/collaborations', auth, async (req, res) => {
  try {
    const collaborations = await Collaboration.findAll({
      where: { researchPostId: req.params.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(collaborations);
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ message: 'Failed to fetch collaborations' });
  }
});

// Invite collaborator
router.post('/:id/collaborations', auth, async (req, res) => {
  try {
    const { userId, role, contribution, expertise } = req.body;
    const post = await ResearchPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Research post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to invite collaborators' });
    }

    const collaboration = await Collaboration.create({
      researchPostId: req.params.id,
      userId,
      role: role || 'contributor',
      contribution,
      expertise: expertise || [],
      invitedBy: req.user.id
    });

    const collaborationWithUser = await Collaboration.findByPk(collaboration.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'username', 'avatar', 'institution', 'position', 'isVerified']
        }
      ]
    });

    res.status(201).json(collaborationWithUser);
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({ message: 'Failed to invite collaborator' });
  }
});

// Respond to collaboration invitation
router.put('/collaborations/:collaborationId/respond', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'
    const collaboration = await Collaboration.findByPk(req.params.collaborationId);
    
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration invitation not found' });
    }

    if (collaboration.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this invitation' });
    }

    await collaboration.update({
      status,
      respondedAt: new Date()
    });

    res.json(collaboration);
  } catch (error) {
    console.error('Error responding to collaboration:', error);
    res.status(500).json({ message: 'Failed to respond to collaboration' });
  }
});

module.exports = router; 