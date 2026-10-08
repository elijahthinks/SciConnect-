require('dotenv').config();
const http = require('http');
const sequelize = require('./src/db');
const { app, ensureDatabase, config } = require('./src/app');
const { initializeSocket } = require('./src/middleware/socket');

// Long-running server: Express + Socket.IO for real-time chat/notifications.
// (On Vercel, api/index.js serves the same Express app without Socket.IO.)
const server = http.createServer(app);
initializeSocket(server);

const PORT = config.port;

// Start server
const startServer = async () => {
  try {
    await ensureDatabase();
  } catch (error) {
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