# Food Chain Rumble

Food Chain Rumble is a full-stack game companion app with a React frontend and an Express/MongoDB backend. The project includes player authentication, character browsing, leaderboards, forum features, and player stat tracking.

## Tech Stack

- Frontend: React, React Router, Redux Toolkit, Axios, React Bootstrap
- Backend: Node.js, Express, Mongoose, JWT authentication
- Database: MongoDB
- Email: Nodemailer / Resend utilities
- Local database tooling: Docker Compose

## Project Structure

```text
food-chain-rumble/
|- client/   # React application
|- server/   # Express API and MongoDB models/controllers/routes
|- docker-compose.yml
|- README.md
```

More detailed learning notes are available in [CODEBASE_GUIDE.md](./CODEBASE_GUIDE.md).

## Main Features

- User registration and login
- Email verification flow
- Protected dashboard with player stats and recent matches
- Character roster and character detail pages
- Global and character-specific leaderboards
- Forum boards, posts, comments, and voting

## Current Limitation

Email verification is not currently available in on live site. The codebase includes an email verification flow, but it is not usable right now because there is not yet a suitable free email delivery solution configured for the project. In order to verify users, 'isEmailVerified' will need to be updated to 'true' in the database documents.

## Prerequisites

- Node.js 18+ recommended
- npm
- MongoDB

You can run MongoDB locally yourself or use the included Docker Compose setup.

## Environment Variables

The backend expects a `.env` file in `server/`. Based on the current codebase, these variables are used:

```env
MONGO_URI=
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=
VERIFICATION_TOKEN_EXPIRE=86400000
EMAIL_FROM=
RESEND_API_KEY=
```

The frontend expects a `.env` file in `client/` with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Adjust values to match your local environment.

## Local Development

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Start MongoDB

Using Docker Compose from the repo root:

```bash
docker compose up -d
```

This starts MongoDB on local port `27018`.

### 3. Start the backend

```bash
cd server
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 4. Start the frontend

```bash
cd client
npm start
```

The frontend runs on `http://localhost:3000`.

## Available Scripts

### Client

- `npm start`: start the React development server
- `npm run build`: create a production build
- `npm test`: run the client test runner

### Server

- `npm start`: run the API with Node
- `npm run dev`: run the API with Nodemon

## How The App Is Organized

### Frontend

- `client/src/pages/`: route-level pages
- `client/src/components/`: reusable UI pieces
- `client/src/services/`: API request wrappers
- `client/src/store/`: Redux store and feature slices

### Backend

- `server/routes/`: API endpoints
- `server/controllers/`: request handling logic
- `server/models/`: MongoDB schemas
- `server/middleware/`: auth and shared request guards
- `server/utils/`: helper functions such as email and MMR logic
- `server/scripts/`: seed and utility scripts

## Notes

- Authentication is JWT-based.
- The frontend stores the token in `localStorage`.
- The shared Axios client automatically attaches the token to protected requests.
