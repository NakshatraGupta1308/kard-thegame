# KARD

A real-time multiplayer card game built from scratch as a full-stack software project.

🎮 **Live Demo:** https://kard-thegame.vercel.app

## Note on First Load
The backend runs on Render's free tier, which puts the server to sleep after a period of inactivity. The first visit after a quiet spell can take up to a minute while the server wakes up. The lobby shows a "Waking up the game server" message during this time, retries automatically, and offers a Retry button if the server still cannot be reached.

## Tech Stack
- **Backend:** Java, Spring Boot, WebSocket (STOMP)
- **Frontend:** React, Vite
- **Deployment:** Render (backend), Vercel (frontend)

## Features
- Create and join game rooms via a live lobby
- Real-time game state sync across all players via WebSocket
- Full card ruleset -- number cards, Skip, Reverse, Draw Two, Wild, Wild Draw Four
- Color picker for wild cards
- UNO-style button with announcement overlay
- Game log showing real-time move history
- Invalid card flash feedback
- Sound effects for card play, draw, and win
- Card animations
- Mobile responsive with dynamic card sizing
- Win/lose screen with match summary

## Project Structure
```
kard/
├── Backend/     # Spring Boot server -- game logic, room manager, WebSocket handlers
└── Frontend/    # React app -- lobby, room, and game UI
```

## Running Locally
```bash
# Backend
cd Backend
mvn spring-boot:run

# Frontend
cd Frontend
npm install
npm run dev
```

## Configuration
The frontend reads the backend URL from the `VITE_BACKEND_URL` environment variable (see `Frontend/.env.example`). If it is not set, it falls back to the local backend at `http://localhost:8080`.

```bash
# Frontend/.env.local
VITE_BACKEND_URL=https://uno-multiplayer-backend.onrender.com
```

For the Vercel deployment, set `VITE_BACKEND_URL` in the project's environment variables so production builds point at the Render backend.

## Health Check
The backend exposes `GET /health`, which returns `200 OK` with a plain text `OK` body. Point an uptime pinger (for example UptimeRobot or cron-job.org) at `https://<your-backend>/health` every 10 to 14 minutes to keep the Render service awake.
