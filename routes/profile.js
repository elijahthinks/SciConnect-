const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { avatarUpload, processAvatar } = require('../middleware/upload');
const { PROFILE_ATTRIBUTES } = require('../utils/userUtils');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Upload avatar
router.post('/avatar', auth, avatarUpload, processAvatar, async (req, res) => {
  try {
    if (!req.processedAvatar) {
      return res.status(400).json({ message: 'No avatar file provided' });
    }

    const user = await User.findByPk(req.user.id);
    
    // Delete old avatar if it exists
    if (user.avatar) {
      try {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user with new avatar path
    user.avatar = req.processedAvatar;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: PROFILE_ATTRIBUTES
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, [
  body('name').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  body('institution').optional().trim(),
  body('position').optional().trim(),
  body('department').optional().trim(),
  body('education').optional().isArray(),
  body('education.*.degree').optional().trim().notEmpty(),
  body('education.*.field').optional().trim().notEmpty(),
  body('education.*.institution').optional().trim().notEmpty(),
  body('education.*.year').optional().isInt(),
  body('publications').optional().isArray(),
  body('publications.*.title').optional().trim().notEmpty(),
  body('publications.*.journal').optional().trim(),
  body('publications.*.year').optional().isInt(),
  body('publications.*.doi').optional().trim(),
  body('publications.*.authors').optional().isArray(),
  body('researchInterests').optional().isArray(),
  body('socialLinks').optional().isObject(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name, bio, institution, position, department,
      education, publications, researchInterests, socialLinks
    } = req.body;

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (institution !== undefined) user.institution = institution;
    if (position !== undefined) user.position = position;
    if (department !== undefined) user.department = department;
    if (education !== undefined) user.education = education;
    if (publications !== undefined) user.publications = publications;
    if (researchInterests !== undefined) user.researchInterests = researchInterests;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;

    // Update lastActive
    user.lastActive = new Date();

    await user.save();

    // Return updated user without sensitive info
    const updatedUser = await User.findByPk(user.id, {
      attributes: PROFILE_ATTRIBUTES
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 