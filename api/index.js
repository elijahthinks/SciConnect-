// Vercel serverless entry point.
//
// Vercel doesn't run a long-lived server: each request to /api/* invokes this
// function, which hands the request to the same Express app that
// backend/server.js uses locally. Socket.IO isn't started here because
// serverless functions can't keep WebSocket connections open.
const { app, ensureDatabase } = require('../backend/src/app');

module.exports = async (req, res) => {
  try {
    await ensureDatabase();
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: 'Database unavailable' }));
  }
  return app(req, res);
};
