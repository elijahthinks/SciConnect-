const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendEmailVerification, sendPasswordReset, sendWelcomeEmail } = require('../utils/emailService');
const auth = require('../middleware/auth');
const config = require('../config')[process.env.NODE_ENV || 'development'];

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: {
    message: 'Too many authentication attempts, please try again later',
    retryAfter: Math.ceil(config.rateLimit.authWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    message: 'Too many requests, please try again later',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  }
});

// Helper function to generate tokens
const generateTokens = (userId, accessExpiresIn = '15m') => {
  const accessToken = jwt.sign(
    { id: userId },
    config.jwtSecret,
    { expiresIn: accessExpiresIn }
  );
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Helper function to check if account is locked
const isAccountLocked = (user) => {
  return user.lockUntil && user.lockUntil > Date.now();
};

// Helper function to increment login attempts
const incrementLoginAttempts = async (user) => {
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If this is the first attempt and account is not locked, just increment
  if (user.loginAttempts < 4 && !isAccountLocked(user)) {
    await user.update({ loginAttempts: user.loginAttempts + 1 });
    return;
  }
  
  // Lock account for 2 hours after 5 failed attempts
  if (user.loginAttempts >= 4) {
    await user.update({
      loginAttempts: user.loginAttempts + 1,
      lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    });
  }
};

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 2, max: 30 }).withMessage('Username must be between 2-30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: errors.array() 
        });
      }

      const { username, email, password, firstName, lastName, institution, fieldOfStudy } = req.body;

      // Check if user already exists
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        institution: institution || null,
        fieldOfStudy: fieldOfStudy || null,
        provider: 'local',
        isActive: true
      });

      // Send verification email
      const emailResult = await sendEmailVerification(user);
      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Don't fail registration if email fails, just log it
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token
      await user.update({
        refreshToken,
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          provider: user.provider
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (isAccountLocked(user)) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
        return res.status(423).json({ 
          message: `Account is locked. Try again in ${lockTimeRemaining} minutes.`
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      // Check password (only for local provider)
      if (user.provider === 'local') {
        if (!user.password) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          await incrementLoginAttempts(user);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        return res.status(400).json({ 
          message: `Please login using ${user.provider}`,
          provider: user.provider
        });
      }

      // Reset login attempts on successful login
      await user.update({
        loginAttempts: 0,
        lockUntil: null,
        lastActive: new Date()
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token
      await user.update({
        refreshToken,
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      res.json({
        message: 'Login successful',
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim() || user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          institution: user.institution,
          position: user.position,
          fieldOfStudy: user.fieldOfStudy,
          isEmailVerified: user.isEmailVerified,
          provider: user.provider
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Guest login: lets visitors look around the demo site without signing up.
// Everyone shares one guest account. It has no password, so the normal
// /login route can't be used to get into it.
const GUEST_EMAIL = 'guest@sciconnect.demo';

router.post('/guest', generalLimiter, async (req, res) => {
  try {
    const [user] = await User.findOrCreate({
      where: { email: GUEST_EMAIL },
      defaults: {
        username: 'guest',
        firstName: 'Guest',
        lastName: 'Visitor',
        bio: 'Exploring SciConnect as a guest.',
        isEmailVerified: true
      }
    });

    // The frontend has no token refresh yet and sends users back to /login
    // when a token expires, so give guests a longer-lived token.
    const { accessToken } = generateTokens(user.id, '1d');
    await user.update({ lastActive: new Date() });

    res.json({
      message: 'Logged in as guest',
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        isGuest: true
      }
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ message: 'Server error during guest login' });
  }
});

// Refresh token
router.post('/refresh', generalLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find user and check if refresh token matches
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check if refresh token is expired
    if (user.refreshTokenExpires < new Date()) {
      await user.update({ refreshToken: null, refreshTokenExpires: null });
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    
    // Update refresh token
    await user.update({
      refreshToken: newRefreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastActive: new Date()
    });

    res.json({
      token: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear refresh token
    await req.user.update({
      refreshToken: null,
      refreshTokenExpires: null
    });

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Verify email
router.get('/verify-email', generalLimiter, async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with verification token
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user as verified
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    // Send welcome email
    await sendWelcomeEmail(user);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// Resend verification email
router.post('/resend-verification', authLimiter, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists, a verification email has been sent' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Send verification email
    const emailResult = await sendEmailVerification(user);
    if (!emailResult.success) {
      console.error('Failed to resend verification email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If the email exists, a password reset email has been sent' });
    }

    // Only send reset email for local provider users
    if (user.provider !== 'local') {
      return res.json({ message: 'If the email exists, a password reset email has been sent' });
    }

    // Send password reset email
    const emailResult = await sendPasswordReset(user);
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    res.json({ message: 'If the email exists, a password reset email has been sent' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', authLimiter, [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find user with reset token
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      loginAttempts: 0,
      lockUntil: null
    });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token
      await user.update({
        refreshToken,
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // Redirect to frontend with token
      res.redirect(`${config.frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      res.redirect(`${config.frontendUrl}/login?error=oauth_error`);
    }
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token
      await user.update({
        refreshToken,
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      // Redirect to frontend with token
      res.redirect(`${config.frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
    } catch (err) {
      console.error('Facebook OAuth callback error:', err);
      res.redirect(`${config.frontendUrl}/login?error=oauth_error`);
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refreshToken', 'emailVerificationToken', 'passwordResetToken'] }
    });

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/account', auth, [
  body('password').if(body('provider').equals('local')).notEmpty()
], async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user;

    // Verify password for local accounts
    if (user.provider === 'local' && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // Soft delete - deactivate account
    await user.update({
      isActive: false,
      email: `deleted_${Date.now()}_${user.email}`,
      refreshToken: null,
      refreshTokenExpires: null
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ message: 'Server error during account deletion' });
  }
});

module.exports = router; 