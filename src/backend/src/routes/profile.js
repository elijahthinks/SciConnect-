const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { avatarUpload, processAvatar, deleteMedia, extractPublicId } = require('../middleware/cloudinary');
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
        // Check if it's a Cloudinary URL
        const publicId = extractPublicId(user.avatar);
        if (publicId) {
          // Delete from Cloudinary
          await deleteMedia(publicId);
        } else {
          // Delete local file
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        await fs.unlink(oldAvatarPath);
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user with new avatar (URL for Cloudinary, path for local)
    const avatarValue = typeof req.processedAvatar === 'object' 
      ? req.processedAvatar.url 
      : req.processedAvatar;
    
    user.avatar = avatarValue;
    await user.save();

    res.json({ 
      avatar: user.avatar,
      ...(typeof req.processedAvatar === 'object' && {
        metadata: {
          publicId: req.processedAvatar.publicId,
          width: req.processedAvatar.width,
          height: req.processedAvatar.height,
          format: req.processedAvatar.format,
          bytes: req.processedAvatar.bytes
        }
      })
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: [
        'id', 'username', 'firstName', 'lastName', 'email', 'avatar', 'bio', 
        'institution', 'position', 'department', 'fieldOfStudy',
        'userType', 'badges', 'skillTags', 'sideProjects',
        'education', 'publications', 'researchInterests',
        'socialLinks', 'isVerified', 'lastActive',
        'createdAt'
      ]
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
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('bio').optional().trim(),
  body('institution').optional().trim(),
  body('position').optional().trim(),
  body('department').optional().trim(),
  body('userType').optional().isIn(['academic', 'hobbyist', 'independent', 'student', 'professional']),
  body('badges').optional().isArray(),
  body('skillTags').optional().isArray(),
  body('sideProjects').optional().isArray(),
  body('sideProjects.*.title').optional().trim().notEmpty(),
  body('sideProjects.*.description').optional().trim(),
  body('sideProjects.*.url').optional().trim(),
  body('sideProjects.*.technologies').optional().isArray(),
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
      firstName, lastName, bio, institution, position, department,
      userType, badges, skillTags, sideProjects,
      education, publications, researchInterests, socialLinks
    } = req.body;

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (institution !== undefined) user.institution = institution;
    if (position !== undefined) user.position = position;
    if (department !== undefined) user.department = department;
    if (userType !== undefined) user.userType = userType;
    if (badges !== undefined) user.badges = badges;
    if (skillTags !== undefined) user.skillTags = skillTags;
    if (sideProjects !== undefined) user.sideProjects = sideProjects;
    if (education !== undefined) user.education = education;
    if (publications !== undefined) user.publications = publications;
    if (researchInterests !== undefined) user.researchInterests = researchInterests;
    if (socialLinks !== undefined) user.socialLinks = socialLinks;

    // Update lastActive
    user.lastActive = new Date();

    await user.save();

    // Return updated user without sensitive info
    const updatedUser = await User.findByPk(user.id, {
      attributes: [
        'id', 'username', 'firstName', 'lastName', 'email', 'avatar', 'bio',
        'institution', 'position', 'department', 'fieldOfStudy',
        'userType', 'badges', 'skillTags', 'sideProjects',
        'education', 'publications', 'researchInterests',
        'socialLinks', 'isVerified', 'lastActive',
        'createdAt'
      ]
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 