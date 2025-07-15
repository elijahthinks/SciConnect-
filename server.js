require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const passport = require('./config/passport');
const sequelize = require('./db');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const socialRoutes = require('./routes/social');
const notificationsRoutes = require('./routes/notifications');
const reactionsRoutes = require('./routes/reactions');
const chatRoutes = require('./routes/chat');
const groupsRoutes = require('./routes/groups');
const onlineStatusRoutes = require('./routes/onlineStatus');
const { initializeSocket } = require('./middleware/socket');
const path = require('path');
const fs = require('fs');
const config = require('./config')[process.env.NODE_ENV || 'development'];

// Import models to establish relationships
require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Notification');
require('./models/Reaction');
require('./models/Message');
require('./models/Conversation');
require('./models/UserRelationship');
// Phase 2: Group Chat Models
require('./models/GroupChat');
require('./models/GroupChatMember');
require('./models/GroupMessage');

const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = initializeSocket(server);

// Trust proxy (for production deployments behind load balancers)
app.set('trust proxy', 1);

// Session configuration for OAuth
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
// Configure CORS: dynamically reflect the request origin when credentials are sent
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    return callback(null, true); // Reflect the origin provided by the request
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create upload directories if they don't exist
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/avatars'),
  path.join(__dirname, 'uploads/images'),
  path.join(__dirname, 'uploads/videos'),
  path.join(__dirname, 'uploads/documents'),
  path.join(__dirname, 'uploads/chat')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve uploaded files with proper content types
app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  if (contentTypes[ext]) {
    res.type(contentTypes[ext]);
  }
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle specific error types
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

const PORT = config.port;

// Enhanced database sync with migrations
const syncDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Try to sync with alter first, but handle SQLite constraints gracefully
    try {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized successfully with alter.');
      return true;
    } catch (alterError) {
      console.log('Alter sync failed, trying basic sync...');
      
      // If alter fails, try basic sync
      await sequelize.sync({ force: false });
      console.log('Database synchronized with basic sync.');
      return true;
    }
  } catch (error) {
    console.error('Database sync error:', error);
    
    // Last resort: try to force sync (WARNING: this will drop tables)
    if (process.env.NODE_ENV === 'development') {
      console.log('Attempting force sync as last resort...');
      try {
        await sequelize.sync({ force: true });
        console.log('Database synchronized with force sync (tables recreated).');
        return true;
      } catch (forceError) {
        console.error('Force sync also failed:', forceError);
        return false;
      }
    }
    
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbReady = await syncDatabase();
  
  if (!dbReady) {
    console.error('Failed to initialize database. Exiting...');
    process.exit(1);
  }
  
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Server is serving both frontend and backend on http://localhost:${PORT}`);
    console.log(`📧 Email service: ${config.email.host}`);
    console.log(`🔐 OAuth configured: Google=${!!config.oauth.google.clientId}, Facebook=${!!config.oauth.facebook.appId}`);
    console.log(`💾 Database: ${config.database.url || 'SQLite default'}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    sequelize.close();
    process.exit(0);
    });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    sequelize.close();
    process.exit(0);
  });
}); 

startServer(); 