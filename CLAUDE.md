# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Food Chain Rumble is a competitive fighting game web app with a React frontend (`client/`) and a Node.js/Express backend (`server/`), using MongoDB as the database.

## Development Commands

### Server (run from `server/`)
```bash
npm run dev      # Start with nodemon (auto-restart on changes)
npm start        # Start with node (production)
```

### Client (run from `client/`)
```bash
npm start        # Start dev server on http://localhost:3000
npm test         # Run tests in interactive watch mode
npm run build    # Production build
```

### Local MongoDB via Docker
```bash
docker-compose up -d    # Start MongoDB on port 27018
docker-compose down     # Stop MongoDB
```

### Database Seeding (run from `server/`)
```bash
node scripts/seedCharacters.js    # Seed character data
node scripts/seedForumData.js     # Seed forum boards/posts
node scripts/seedTestData.js      # Seed general test data
node scripts/testConnection.js    # Verify DB connection
```

## Environment Variables

**Server** (`.env` in `server/`):
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for signing JWTs
- `CLIENT_URL` — Frontend origin for CORS (e.g. `https://your-app.com`)
- `PORT` — Server port (default: 5000)
- `RESEND_API_KEY` — API key for Resend email service

**Client** (`.env` in `client/`):
- `REACT_APP_API_URL` — Backend base URL (e.g. `http://localhost:5000`)

## Architecture

### Backend (`server/`)

Express app with the following structure:
- `server.js` — Entry point; mounts security middleware (Helmet, rate limiting, CORS), connects to MongoDB, and registers all routes under `/api`
- `routes/index.js` — Aggregates all route modules:
  - `/api/auth` — Register, login, email verification
  - `/api/users` — User profile management
  - `/api/characters` — Character roster (read/admin write)
  - `/api/matches` — Match submission and history
  - `/api/leaderboard` — MMR-ranked player standings
  - `/api/forum` — Forum boards, posts, comments
  - `/api/user` — Per-user stats
- `middleware/auth.js` — JWT verification (`protect`), role checks (`isAdmin`, `isModerator`, `isModeratorOrAdmin`)
- `utils/mmrHelpers.js` — Elo-based MMR calculation, tier/division mapping (Bronze → Grandmaster), performance bonus logic
- `utils/sendEmail.js` + `utils/emailTemplates.js` — Email delivery via [Resend](https://resend.com)

**Auth flow:** JWTs are issued on login/register and expected as `Authorization: Bearer <token>` on protected endpoints. The server auto-unbans users whose `banExpiresAt` has passed.

**Deployment note:** `app.set('trust proxy', 1)` is set for Render hosting.

### Frontend (`client/src/`)

React 19 app bootstrapped with Create React App:
- `store/store.js` — Redux Toolkit store with slices: `auth`, `characters`, `leaderboard`, `userStats`, `forum`
- `services/api.js` — Axios instance configured with `REACT_APP_API_URL`; automatically attaches JWT from `localStorage` and redirects to `/login` on 401
- `services/` — Per-feature service modules (`authService`, `characterService`, `forumService`, etc.) that call the API
- `pages/` — Top-level route components (one per route)
- `components/` — Organized into subdirectories: `layout/`, `character/`, `forum/`, `match/`, `user/`, `common/`
- `hooks/` — Custom React hooks

**Route protection:** `<ProtectedRoute>` wrapper in `App.jsx` checks `state.auth.isAuthenticated`; unauthenticated users are redirected to `/login`.

### Data Models

- **User** — Username, email (with verification flow), hashed password, role (`user`/`admin`), ban system with history
- **Character** — Role (`fighter`/`tank`/`assassin`), abilities (active/passive/ultimate), talents (greater/lesser), global aggregate stats, display colors
- **Match** — Supports `1v1`/`2v2`/`3v3` ranked/casual modes; stores per-player stats (kills, deaths, assists, damage dealt/taken), talents used, and result
- **PlayerStats / TalentStats / BuildStats** — Per-user aggregated statistics
- **ForumBoard / ForumPost / ForumComment** — Forum hierarchy with moderator support

### MMR System

Located in `server/utils/mmrHelpers.js`. Uses Elo formula with a K-factor of 20. Seven tiers: Bronze (0–1199), Silver (1200–1399), Gold (1400–1599), Platinum (1600–1799), Diamond (1800–1999), Master (2000–2299), Grandmaster (2300+). Each tier has 4 divisions. A performance bonus (±4) adjusts MMR based on damage, tanking, assists, and deaths relative to team averages.
