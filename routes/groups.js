const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// Import models
const GroupChat = require('../models/GroupChat');
const GroupChatMember = require('../models/GroupChatMember');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

const router = express.Router();

// Get all groups user is a member of
router.get('/', auth, async (req, res) => {
  try {
    const groups = await GroupChat.findAll({
      include: [
        {
          model: GroupChatMember,
          as: 'members',
          where: { userId: req.user.id },
          attributes: []
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['lastActivity', 'DESC']]
    });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Discover all available groups (for joining)
router.get('/discover', auth, async (req, res) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    
    // Build where clause
    const whereClause = {
      isActive: true
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } }
      ];
    }

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const groups = await GroupChat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: GroupChatMember,
          as: 'members',
          attributes: ['id'],
          where: { userId: req.user.id },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });

    // Add member count and user membership status to each group
    const groupsWithDetails = await Promise.all(
      groups.rows.map(async (group) => {
        const memberCount = await GroupChatMember.count({
          where: { groupChatId: group.id, status: 'active' }
        });

        const isMember = group.members && group.members.length > 0;
        
        return {
          ...group.toJSON(),
          currentMemberCount: memberCount,
          isMember: isMember,
          members: undefined // Remove the members array from response
        };
      })
    );

    res.json({
      groups: groupsWithDetails,
      total: groups.count,
      page: parseInt(page),
      totalPages: Math.ceil(groups.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error discovering groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new group
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Group name is required'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('type').isIn(['public', 'private', 'research_group', 'study_group']).withMessage('Invalid group type'),
  body('tags').optional().isArray(),
  body('researchArea').optional().trim(),
  body('maxMembers').optional().isInt({ min: 2, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, type, tags, researchArea, maxMembers, settings } = req.body;

    const group = await GroupChat.create({
      name,
      description,
      type,
      tags: tags || [],
      researchArea,
      maxMembers: maxMembers || 100,
      settings: settings || {},
      createdBy: req.user.id
    });

    // Add creator as first member with admin role
    await GroupChatMember.create({
      groupChatId: group.id,
      userId: req.user.id,
      role: 'admin',
      joinedAt: new Date()
    });

    // Fetch the group with creator info
    const groupWithCreator = await GroupChat.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    res.status(201).json(groupWithCreator);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a group
router.post('/:groupId/join', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GroupChat.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isActive) {
      return res.status(400).json({ message: 'This group is no longer active' });
    }

    // Check if user is already a member
    const existingMember = await GroupChatMember.findOne({
      where: { groupChatId: groupId, userId: req.user.id }
    });

    if (existingMember) {
      if (existingMember.status === 'banned') {
        return res.status(403).json({ message: 'You are banned from this group' });
      }
      if (existingMember.status === 'left') {
        // Re-join the group
        await existingMember.update({
          status: 'active',
          joinedAt: new Date()
        });
      } else {
        return res.status(400).json({ message: 'Already a member of this group' });
      }
    } else {
      // Check if group is full
      const memberCount = await GroupChatMember.count({
        where: { groupChatId: groupId, status: 'active' }
      });

      if (memberCount >= group.maxMembers) {
        return res.status(400).json({ message: 'Group is full' });
      }

      // Add user to group
      await GroupChatMember.create({
        groupChatId: groupId,
        userId: req.user.id,
        role: 'member',
        status: 'active',
        joinedAt: new Date()
      });
    }

    // Get updated member count
    const updatedMemberCount = await GroupChatMember.count({
      where: { groupChatId: groupId, status: 'active' }
    });

    res.json({ 
      message: 'Successfully joined group',
      group: {
        ...group.toJSON(),
        currentMemberCount: updatedMemberCount,
        isMember: true
      }
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group messages
router.get('/:groupId/messages', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a member of the group
    const member = await GroupChatMember.findOne({
      where: { groupChatId: groupId, userId: req.user.id }
    });

    if (!member) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const messages = await GroupMessage.findAll({
      where: { groupChatId: groupId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message to group
router.post('/:groupId/messages', auth, [
  body('content').trim().isLength({ min: 1 }).withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'video', 'file'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { groupId } = req.params;
    const { content, type = 'text' } = req.body;

    // Verify user is a member of the group
    const member = await GroupChatMember.findOne({
      where: { groupChatId: groupId, userId: req.user.id }
    });

    if (!member) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const message = await GroupMessage.create({
      groupChatId: groupId,
      senderId: req.user.id,
      content,
      messageType: type,
      status: 'sent'
    });

    // Update group's last activity
    await GroupChat.update(
      { lastActivity: new Date() },
      { where: { id: groupId } }
    );

    // Fetch message with sender info
    const messageWithSender = await GroupMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ]
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group members
router.get('/:groupId/members', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is a member of the group
    const member = await GroupChatMember.findOne({
      where: { groupChatId: groupId, userId: req.user.id }
    });

    if (!member) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const members = await GroupChatMember.findAll({
      where: { groupChatId: groupId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar', 'institution', 'position']
        }
      ],
      order: [['joinedAt', 'ASC']]
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 