const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config')[process.env.NODE_ENV || 'development'];

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No auth token found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth; 