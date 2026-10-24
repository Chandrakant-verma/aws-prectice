# RepoLens

Paste a public GitHub repo URL, get it cloned and analyzed (file count, folder
count, languages used), and chat with an AI about that repository's code.

## Stack

- **Backend:** Node.js, Express 5, MongoDB/Mongoose, JWT auth, `simple-git`,
  Gemini (`@google/genai`)
- **Frontend:** React + Vite, Tailwind CSS, React Router, Axios,
  react-toastify

## Project layout

```
repolens/
  server/   Express API
  client/   React (Vite) frontend
```

## Setup

### 1. Backend

```bash
cd server
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, etc.
npm install
npm run dev             # starts on http://localhost:5000
```

You need a running MongoDB instance (local or Atlas) and a Gemini API key
from Google AI Studio.

### 2. Frontend

```bash
cd client
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev             # starts on http://localhost:5173
```

Open http://localhost:5173, register an account, and paste a public GitHub
URL (e.g. `https://github.com/expressjs/express`) into the dashboard.

## Notes on behavior

- `GET /api/repositories` always re-clones and re-scans every repo the user
  owns before responding, so the dashboard numbers are never stale. If one
  repo fails to refresh (deleted, renamed, rate-limited), that row falls back
  to its last stored stats instead of failing the whole list.
- Each `(user, githubUrl)` pair maps to one deterministic local folder
  (a hash of `userId:normalizedUrl`) under `server/clones/`, which is wiped
  and recreated on every re-analysis — no disk leakage from timestamped
  folders.
- A user can never store the same URL twice — enforced by a unique compound
  Mongo index on `{ user, githubUrl }`; re-analyzing an existing URL updates
  that row in place.
- Clones are shallow (`--depth 1 --single-branch`), run with
  `GIT_TERMINAL_PROMPT=0`, and have a 30s timeout, so a private or mistyped
  URL fails fast instead of hanging the request.
# repolens-1
# aws-prectice
