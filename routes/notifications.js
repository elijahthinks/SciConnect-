const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const { sendNotification } = require('../middleware/socket');

// Get all notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: ['sender']
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark a notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id,
        recipientId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { recipientId: req.user.id, read: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Create a new notification
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, type, content, relatedModelId, relatedModelType } = req.body;
    
    const notification = await Notification.create({
      recipientId,
      senderId: req.user.id,
      type,
      content,
      relatedModelId,
      relatedModelType
    });

    // Send real-time notification
    await sendNotification(recipientId, notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

module.exports = router; 