const express = require('express');
const cors = require('cors');
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
const researchRoutes = require('./routes/research');
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
// Research Models
require('./models/ResearchPost');
require('./models/FactCheck');
require('./models/Collaboration');

const app = express();
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

// Create upload directories if they don't exist.
// Serverless hosts like Vercel have a read-only filesystem, so this is
// skipped there (media uploads go to Cloudinary instead).
const uploadsDir = path.join(__dirname, 'uploads');
if (!process.env.VERCEL) {
  ['', 'avatars', 'images', 'videos', 'documents', 'chat'].forEach(sub => {
    fs.mkdirSync(path.join(uploadsDir, sub), { recursive: true });
  });
}

// Serve static files from the frontend build directory
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

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
app.use('/api/research', researchRoutes);

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
}, express.static(uploadsDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
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

// Enhanced database sync with migrations
let lastDbError = null;
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
    lastDbError = error;
    
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

// Make sure the database is ready before handling requests. The promise is
// cached so the sync only runs once per process (or once per serverless
// instance on Vercel, instead of on every request).
let dbReadyPromise = null;
const ensureDatabase = () => {
  if (!dbReadyPromise) {
    dbReadyPromise = syncDatabase().then(ok => {
      if (!ok) {
        dbReadyPromise = null; // allow a retry on the next request
        throw new Error(`Failed to initialize database: ${lastDbError ? lastDbError.message : 'unknown error'}`);
      }
    });
  }
  return dbReadyPromise;
};

module.exports = { app, ensureDatabase, config };
