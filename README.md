# SciConnect

A social platform for scientists, tech enthusiasts, and hobbyists to share research, discuss ideas, and collaborate.

## Features

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
├── backend/          # Express API + Socket.IO server
│   ├── server.js     # App entry point
│   ├── src/
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

## Environment Variables

Copy `backend/env.example` to `backend/.env` and configure. Key variables:

| Variable | Purpose |
| -------- | ------- |
| `PORT` | Backend port (default `3000`) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` / `POSTGRES_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets |
| `CLIENT_URL`, `FRONTEND_URL` | Frontend origin (CORS, email links) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP for password reset emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media storage |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Facebook OAuth |
| `LOG_LEVEL` | Winston log level |

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
