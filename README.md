# SciConnect

A social platform for scientists and tech enthusiasts built with Node.js, Express and a React frontend.

## Setup

1. **Install dependencies**

```bash
npm run install:all
```

2. **Environment variables**

Create a `.env` file and define:

```
JWT_SECRET=your-secret
PORT=3000
CLIENT_URL=http://localhost:5173
```

3. **Start the application**

Backend and frontend can be started together in development:

```bash
npm run dev:full
```

The server automatically syncs the SQLite database on start.

4. **Build frontend**

```bash
npm run build
```

## Testing

Run Jest tests with:

```bash
npm test
```

`test-chat.js` and `test-posts.js` provide basic manual API checks.
