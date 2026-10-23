const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getGuestUser } = require('../utils/guestUser');
const config = require('../config')[process.env.NODE_ENV || 'development'];

// There's no sign-in: a request with a valid token acts as that user,
// and every other request acts as the shared guest user.
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        user = await User.findByPk(decoded.id);
      } catch {
        // Expired or invalid token: fall back to the guest
      }
    }

    req.user = user || await getGuestUser();
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = auth;
