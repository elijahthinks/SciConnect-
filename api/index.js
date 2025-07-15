const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('../config/passport');
const { sequelize, initDatabase } = require('../db-vercel');
const authRoutes = require('../routes/auth');
const profileRoutes = require('../routes/profile');
const postsRoutes = require('../routes/posts');
const commentsRoutes = require('../routes/comments');
const socialRoutes = require('../routes/social');
const notificationsRoutes = require('../routes/notifications');
const reactionsRoutes = require('../routes/reactions');
const chatRoutes = require('../routes/chat');
const groupsRoutes = require('../routes/groups');
const onlineStatusRoutes = require('../routes/onlineStatus');
const path = require('path');
const fs = require('fs');
const config = require('../config')[process.env.NODE_ENV || 'production'];

// Import models to establish relationships
require('../models/User');
require('../models/Post');
require('../models/Comment');
require('../models/Notification');
require('../models/Reaction');
require('../models/Message');
require('../models/Conversation');
require('../models/UserRelationship');
require('../models/GroupChat');
require('../models/GroupChatMember');
require('../models/GroupMessage');

const app = express();

// Trust proxy (for Vercel)
app.set('trust proxy', 1);

// Session configuration for OAuth (using memory store for serverless)
app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/online-status', onlineStatusRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' });
  }
  
  res.status(500).json({ message: 'Something went wrong!' });
});

// Vercel serverless function handler
module.exports = app; 