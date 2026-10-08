# SciConnect

A social platform for scientists, tech enthusiasts, and hobbyists to share research, discuss ideas, and collaborate.

## Features

- **Guest access**: visitors can click **Continue as guest** on the login or sign-up page to explore without creating an account
- **Accounts & auth**: email/password sign-up with JWT, password reset by email, and optional Google/Facebook OAuth
- **Profiles**: avatars, skill tags, side projects, and open-access profiles
- **Feed & posts**: create posts, comment, and react
- **Research feed**: research posts with fact-checking and collaboration requests
- **Social graph**: follow users and manage connections
- **Messaging**: real-time direct messages and group chats (Socket.IO), including media uploads
- **Notifications & presence**: live notifications and online status

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, Zustand, React Router, Socket.IO client |
| Backend  | Node.js (18+), Express, Sequelize, Socket.IO, Passport, Winston |
| Data     | PostgreSQL (SQLite for local development), Redis (optional) |
| Media    | Cloudinary, Sharp, Multer |

## Project Structure

```
.
├── api/index.js      # Vercel serverless entry point
├── vercel.json       # Vercel build and routing config
├── backend/          # Express API + Socket.IO server
│   ├── server.js     # Local server entry point (Express + Socket.IO)
│   ├── src/
│   │   ├── app.js    # The Express app (shared with Vercel)
│   │   ├── config/   # Passport, Redis
│   │   ├── middleware/
│   │   ├── migrations/
│   │   ├── models/   # Sequelize models
│   │   ├── routes/   # /api/* route handlers
│   │   └── utils/
│   ├── scripts/      # Seeding, migration, and test/debug scripts
│   └── env.example   # Environment variable template
└── frontend/         # React + Vite client
    └── src/
        ├── components/
        ├── pages/
        └── store/
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 12+ (optional for local development; SQLite is supported)
- Redis (optional, for sessions and caching)

### Installation

```bash
git clone https://github.com/elijahthinks/SciConnect-.git
cd SciConnect-

# Backend
cd backend
npm install
cp env.example .env   # then fill in your values

# Frontend
cd ../frontend
npm install
```

### Running in Development

Start the backend (runs on `http://localhost:3000` by default):

```bash
cd backend
npm run dev
```

In a second terminal, start the frontend (Vite proxies `/api` requests to the backend):

```bash
cd frontend
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Deploying to Vercel

The repo is set up to deploy as a single Vercel project: the React app is served as static files and the Express API runs as a serverless function.

### How it works

| File | Role |
| ---- | ---- |
| `vercel.json` | Installs both packages, builds `frontend/`, sends `/api/*` to the function and everything else to `index.html` (so React Router handles page URLs) |
| `api/index.js` | The serverless function: makes sure the database is ready, then hands the request to the Express app |
| `backend/src/app.js` | The Express app itself, shared by Vercel and the local server |
| `backend/server.js` | Local/long-running server: the same app plus Socket.IO |

### Steps

1. Push this repo to GitHub and import it at [vercel.com/new](https://vercel.com/new). Leave **Root Directory** as the repo root; `vercel.json` sets the build settings.
2. Add a Postgres database. In the Vercel project go to **Storage** and connect a Postgres provider (e.g. Neon). This sets `POSTGRES_URL` for you. Tables are created automatically on the first request.
3. Under **Settings → Environment Variables**, add at least:
   - `JWT_SECRET` and `JWT_REFRESH_SECRET` (long random strings, e.g. from `openssl rand -hex 32`)
   - `CLIENT_URL` and `FRONTEND_URL`: your Vercel URL, e.g. `https://your-app.vercel.app`
   - `CLOUDINARY_*` if you want image/video uploads to work
   - `EMAIL_*` if you want verification and password reset emails
4. Deploy, then check `https://your-app.vercel.app/api/health`.

### Limitations on Vercel

Serverless functions start for each request and stop afterwards, which affects some features:

- **Real-time features are off.** Live chat, typing indicators, live notifications and online status use Socket.IO, which needs a server that stays running. Pages still load data through the REST API; they just don't update live. To get them back, run `backend/server.js` on a host that supports long-running servers (Render, Railway, Fly.io) and set `VITE_SOCKET_URL` in Vercel to that server's URL.
- **No SQLite.** The filesystem is read-only and wiped between requests, so a Postgres URL is required.
- **No local file uploads.** Use Cloudinary for media.
- **Cold starts.** The first request after a quiet period is slower while the function boots and connects to the database.

## Environment Variables

Copy `backend/env.example` to `backend/.env` and configure. Key variables:

| Variable | Purpose |
| -------- | ------- |
| `PORT` | Backend port (default `3000`) |
| `NODE_ENV` | `development` or `production` |
| `POSTGRES_URL` / `DATABASE_URL` | PostgreSQL connection string. Without one, local development uses SQLite |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets |
| `CLIENT_URL`, `FRONTEND_URL` | Frontend origin (CORS, email links) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP for password reset emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media storage |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Facebook OAuth |
| `LOG_LEVEL` | Winston log level |

Frontend (set in Vercel or `frontend/.env`):

| Variable | Purpose |
| -------- | ------- |
| `VITE_SOCKET_URL` | URL of a running Socket.IO server. Defaults to `http://localhost:3000` in development; leave unset on Vercel to turn real-time features off |

## Useful Scripts

Backend (`backend/`):

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the server with nodemon |
| `npm start` | Start the server |
| `npm run start:prod` | Start in production mode |
| `npm run setup` | Run the interactive setup script |
| `npm run migrate` | Migrate data to PostgreSQL |
| `npm run lint` | Lint the backend |
| `npm test` | Run tests (Jest) |
| `npm run pm2:start` | Start with PM2 |

Frontend (`frontend/`):

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the frontend |

## API Overview

All endpoints are served under `/api`:

`/auth`, `/profile`, `/posts`, `/comments`, `/social`, `/notifications`, `/reactions`, `/chat`, `/groups`, `/online-status`, `/research`

## Further Documentation

- [Setup guide](backend/SETUP.md)
- [Production deployment](backend/PRODUCTION.md)
- [Quick PostgreSQL setup](backend/quick-postgres-setup.md)
- [Chat](backend/CHAT_README.md) · [Online status](backend/ONLINE_STATUS_README.md)
- [Research features](backend/RESEARCH_FEATURES.md) · [Open-access features](backend/OPEN_ACCESS_FEATURES.md)

## License

MIT
