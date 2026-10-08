// Vercel serverless entry point.
//
// Vercel doesn't run a long-lived server: each request to /api/* invokes this
// function, which hands the request to the same Express app that
// backend/server.js uses locally. Socket.IO isn't started here because
// serverless functions can't keep WebSocket connections open.

const sendError = (res, message) => {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message }));
};

// Catch setup problems up front and explain them, instead of crashing with an
// error page the frontend can't show.
const missingEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET'].filter(name => !process.env[name]);

let app, ensureDatabase, loadError;
try {
  ({ app, ensureDatabase } = require('../backend/src/app'));
} catch (error) {
  console.error('Failed to load the backend:', error);
  loadError = error;
}

module.exports = async (req, res) => {
  if (missingEnv.length) {
    return sendError(res, `Missing environment variables: ${missingEnv.join(', ')}. Add them in Vercel under Settings → Environment Variables, then redeploy.`);
  }
  if (loadError) {
    return sendError(res, `The backend failed to start: ${loadError.message}`);
  }

  try {
    await ensureDatabase();
  } catch (error) {
    console.error('Database initialization failed:', error);
    return sendError(res, `Database unavailable: ${error.message}`);
  }
  return app(req, res);
};
