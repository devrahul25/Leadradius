# LeadRadius AI — Full Stack

AI-powered local business lead intelligence platform. Two apps in one repo:

- **Frontend** (root) — Next.js 15 + React 19 + Tailwind. Auth, dashboard analytics, radius search, scored lead table, CSV export. See `app/`, `components/`, `lib/`.
- **Backend** (`backend/`) — Node + Express + TypeScript + Prisma + MySQL + BullMQ + Redis. JWT auth, Google Places integration with cost-optimized Place Details, lead scoring, CSV/Excel export queue, admin endpoints. See `backend/README.md` for the full module map.

The frontend talks to the backend through `NEXT_PUBLIC_API_URL`. If that env var is unset, the frontend falls back to local mock data — so the UI works standalone too.

## Quickstart — run everything together

You'll need:
- Node 20+ (you have v20/v22)
- MySQL running locally (Homebrew: `brew install mysql && brew services start mysql`)
- Redis running locally (Homebrew: `brew install redis && brew services start redis`)
- `mysql` CLI on your `$PATH` for the one-liner below

```bash
# 1. Install everything (frontend + backend)
npm run install:all

# 2. Create the DB and a root password
mysql -uroot <<'SQL'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'rootpw';
CREATE DATABASE IF NOT EXISTS leadradius;
FLUSH PRIVILEGES;
SQL

# 3. Configure env vars
cp .env.example .env.local
cp backend/.env.example backend/.env
# Edit backend/.env: set JWT_SECRET, JWT_REFRESH_SECRET, leave GOOGLE_API_KEY blank
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 is already set

# 4. Run database migrations
npm run backend:migrate

# 5. Boot frontend + API + worker, all in one terminal
npm run dev:all
```

Open http://localhost:3000. Register a new user — you should see it land in the MySQL `User` table (`mysql -uroot -prootpw -e "SELECT id, name, email, role FROM leadradius.User;"`).

Run a search on the **Search Leads** page — even without a Google API key, the backend generates seeded leads (because `USE_LIVE_PLACES=false`), persists them to MySQL, and your **Saved Leads** page shows the freshly stored set.

## What's wired up

| Frontend action | Backend endpoint | Notes |
| --- | --- | --- |
| Register form submit | `POST /api/v1/auth/register` | bcrypt + JWT pair returned |
| Login form submit | `POST /api/v1/auth/login` | JWT pair stored in localStorage |
| Logout button | `POST /api/v1/auth/logout` | clears refresh token server-side |
| Search form submit | `POST /api/v1/leads/search` then `GET /api/v1/leads` | persists scored leads, returns the set |
| Leads page filters | `GET /api/v1/leads?...` (planned) | currently reads the persisted set |
| CSV export | `GET /api/v1/export/csv` (planned) | currently exports from local table |

The frontend gracefully falls back to mock data if `NEXT_PUBLIC_API_URL` is unset — useful when you want to demo the UI without standing up MySQL/Redis.

## Going live with Google Places

Edit `backend/.env`:

```env
GOOGLE_API_KEY=AIza...
USE_LIVE_PLACES=true
```

Restart the backend. From now on `/leads/search` calls Google Geocoding → Nearby Search → Place Details (only for `rating ≥ 4.2 && reviews ≥ 80` per the spec's cost gate). All three calls are Redis-cached for 12 hours.

## Repo layout

```
leadradius-ai/
├── app/                        Next.js App Router pages
│   ├── (auth)/login,register
│   └── (dashboard)/dashboard,search,leads
├── components/                 Sidebar, Navbar, charts, table, search form, UI primitives
├── lib/                        api client, auth (real + mock), config, lead-scoring, mock-data
├── backend/                    Express + Prisma + BullMQ
│   ├── src/
│   │   ├── config/             env (zod), logger (winston), redis, swagger
│   │   ├── controllers/        auth, lead, export, admin, health
│   │   ├── database/           prisma client singleton
│   │   ├── jobs/               BullMQ processors (csv-export, duplicate-cleanup)
│   │   ├── middlewares/        auth, validate, rate-limit, error-handler, not-found
│   │   ├── queues/             BullMQ queue registry
│   │   ├── repositories/       Prisma data access
│   │   ├── routes/v1/          auth, leads, export, admin
│   │   ├── services/           auth, lead, export, admin, google-places, mock-leads
│   │   ├── utils/              ApiError, response, tokens, password, haversine, lead-scoring, cache
│   │   ├── validators/         zod schemas
│   │   ├── workers/            worker bootstrap
│   │   ├── app.ts              express factory
│   │   └── index.ts            HTTP server entrypoint
│   ├── prisma/schema.prisma    User, BusinessLead, SearchHistory, ExportJob
│   ├── Dockerfile + docker-compose.yml + ecosystem.config.js
│   └── README.md
├── package.json                frontend deps + dev:all orchestrator
└── README.md                   ← you are here
```

## Useful one-liners

```bash
# Just the API + worker (skip frontend)
npm run backend:dev      # in one terminal
npm run backend:worker   # in another

# Health check
curl localhost:4000/health

# Browse the API docs (Swagger UI)
open http://localhost:4000/api/docs

# Tail worker logs
# (workers print to stdout in dev — concurrently colors them yellow)
```

## Troubleshooting

**`tsx` SyntaxError on `npm run backend:dev`** — your backend `node_modules` was corrupted by an interrupted install. `cd backend && rm -rf node_modules package-lock.json && npm install`.

**`P1000: Authentication failed` from Prisma** — root has no password. Run the `ALTER USER` block above, then update `backend/.env` to `DATABASE_URL="mysql://root:rootpw@localhost:3306/leadradius"`.

**`P1001: Can't reach database server`** — MySQL isn't running. `brew services start mysql`.

**Frontend shows mock data even though backend is running** — `.env.local` doesn't include `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`, or the file isn't picked up (restart `next dev`).

**CORS error in browser console** — your frontend origin isn't in the backend allowlist. Edit `backend/.env`: `CORS_ORIGINS=http://localhost:3000`.

## License

All rights reserved. Built for the LeadRadius AI product team.
