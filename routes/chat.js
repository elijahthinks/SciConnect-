const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op, literal } = require('sequelize');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { chatMediaUpload, processChatMedia, uploadProgress } = require('../middleware/cloudinary');

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['lastMessageAt', 'DESC']]
    });

    // Format conversations to show the other participant
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participant1Id === req.user.id 
        ? conv.participant2 
        : conv.participant1;
      const unreadCount = conv.participant1Id === req.user.id 
        ? conv.unreadCount1 
        : conv.unreadCount2;

      return {
        id: conv.id,
        conversationId: conv.conversationId,
        otherParticipant,
        lastMessageAt: conv.lastMessageAt,
        unreadCount
      };
    });

    res.json(formattedConversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create conversation between two users
router.post('/conversations', auth, [
  body('participantId').isInt().withMessage('Participant ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { participantId } = req.body;
    
    if (participantId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          {
            participant1Id: req.user.id,
            participant2Id: participantId
          },
          {
            participant1Id: participantId,
            participant2Id: req.user.id
          }
        ]
      }
    });

    if (!conversation) {
      // Create new conversation
      const conversationId = `conv_${Math.min(req.user.id, participantId)}_${Math.max(req.user.id, participantId)}`;
      conversation = await Conversation.create({
        conversationId,
        participant1Id: Math.min(req.user.id, participantId),
        participant2Id: Math.max(req.user.id, participantId)
      });
    }

    // Get the other participant info
    const otherParticipant = await User.findByPk(participantId, {
      attributes: ['id', 'username', 'firstName', 'lastName', 'avatar']
    });

    res.json({
      id: conversation.id,
      conversationId: conversation.conversationId,
      otherParticipant,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: 0
    });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      where: {
        conversationId,
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId,
          receiverId: req.user.id,
          isRead: false
        }
      }
    );

    // Update unread count
    const unreadField = conversation.participant1Id === req.user.id ? 'unreadCount1' : 'unreadCount2';
    await conversation.update({ [unreadField]: 0 });

    // Get messages
    const messages = await Message.findAll({
      where: { conversationId },
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
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, [
  body('content').notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'video', 'file']),
  body('mediaUrl').optional().isURL()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', mediaUrl } = req.body;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      where: {
        conversationId,
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get receiver ID
    const receiverId = conversation.participant1Id === req.user.id
      ? conversation.participant2Id
      : conversation.participant1Id;

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      receiverId,
      content,
      messageType,
      mediaUrl,
      status: 'sending'
    });

    // Update conversation's last message
    await conversation.update({
      lastMessageId: message.id,
      lastMessageAt: message.createdAt
    });

    // Include sender info in response
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    });

    res.json(messageWithSender);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update message status
router.put('/conversations/:conversationId/messages/:messageId/status', auth, [
  body('status').isIn(['sent', 'delivered', 'read', 'failed']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { conversationId, messageId } = req.params;
    const { status } = req.body;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      where: {
        conversationId,
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update message status
    const message = await Message.findOne({
      where: {
        id: messageId,
        conversationId
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow receiver to mark as delivered/read
    if ((status === 'delivered' || status === 'read') && message.receiverId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this message status' });
    }

    // Only allow sender to mark as sent/failed
    if ((status === 'sent' || status === 'failed') && message.senderId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this message status' });
    }

    await message.update({
      status,
      ...(status === 'read' ? { readAt: new Date() } : {})
    });

    res.json(message);
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all messages as read in a conversation
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      where: {
        conversationId,
        [Op.or]: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update all unread messages where user is receiver
    await Message.update(
      {
        status: 'read',
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          conversationId,
          receiverId: req.user.id,
          status: { [Op.ne]: 'read' }
        }
      }
    );

    // Reset unread count
    const unreadField = conversation.participant1Id === req.user.id ? 'unreadCount1' : 'unreadCount2';
    await conversation.update({ [unreadField]: 0 });

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload chat media
router.post('/media', auth, chatMediaUpload, processChatMedia, async (req, res) => {
  try {
    if (!req.processedChatMedia) {
      return res.status(400).json({ message: 'No media file provided' });
    }

    res.json(req.processedChatMedia);
  } catch (err) {
    console.error('Error uploading chat media:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upload progress
router.get('/media/progress/:uploadId', auth, (req, res) => {
  const { uploadId } = req.params;
  
  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const progressHandler = (data) => {
    if (data.uploadId === uploadId) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };
  
  uploadProgress.on('progress', progressHandler);
  
  // Clean up on client disconnect
  req.on('close', () => {
    uploadProgress.removeListener('progress', progressHandler);
  });
});

module.exports = router; 