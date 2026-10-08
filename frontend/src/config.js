// Where the real-time (Socket.IO) server lives.
// - Development: the local backend on port 3000.
// - Production: only if VITE_SOCKET_URL is set. Vercel's serverless functions
//   can't hold WebSocket connections open, so on Vercel real-time features are
//   off unless you run the socket server somewhere else and point this at it.
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : null);
