const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors: errors.array() });
      }

      const { name, email, password } = req.body;
      console.log('Registration attempt:', { name, email }); // Log registration attempt

      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({ name, email, password: hashedPassword });
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err); // Log the actual error
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log('Login attempt:', { email }); // Log login attempt

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email 
        } 
      });
    } catch (err) {
      console.error('Login error:', err); // Log the actual error
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router; 