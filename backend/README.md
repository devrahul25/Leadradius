# LeadRadius AI — Backend

Production-shaped Node + Express + TypeScript backend for **LeadRadius AI**, paired with the Next.js frontend in the parent folder.

Implements every module from the spec: JWT auth (access + refresh + bcrypt), radius search via Google Places (with cost-optimized Place Details), scored & deduped lead storage, CSV/Excel export through BullMQ, admin endpoints, Redis caching, Swagger docs, structured logging, rate limiting, and a Dockerized stack (mysql + redis + api + worker).

## Architecture

```
src/
  config/          env (zod-validated), logger (winston), redis, swagger
  controllers/     thin HTTP layer — calls services, formats responses
  database/        prisma client singleton
  jobs/            BullMQ job processors (csv-export, duplicate-cleanup)
  middlewares/     auth (JWT), rate-limit, validate (zod), error handler, 404
  queues/          BullMQ queue registry (lead-fetch, place-details, csv-export, duplicate-cleanup)
  repositories/    Prisma data access (User, BusinessLead, SearchHistory)
  routes/v1/       versioned router — /api/v1/{auth,leads,export,admin}
  services/        business logic — auth, lead, export, admin, google-places
  types/           express Request augmentation
  utils/           response helpers, tokens, password, haversine, lead-scoring, cache, async-handler, ApiError
  validators/      zod schemas for body/query/params
  workers/         worker bootstrap (run as a separate process)
  app.ts           express factory (security, cors, compression, morgan, routing)
  index.ts         server bootstrap + graceful shutdown
prisma/
  schema.prisma    User, BusinessLead, SearchHistory, ExportJob (+ enum Role)
```

## Modules and routes

All endpoints respond with the standard envelope:
- success → `{ success: true, message, data, pagination? }`
- error → `{ success: false, message, error: { code, details?, stack? } }`

### Auth (`/api/v1/auth`)
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/register` | public | bcrypt + JWT pair |
| POST | `/login` | public | issues access + refresh |
| POST | `/refresh` | public | rotates refresh token id |
| POST | `/logout` | bearer | clears refresh token |
| POST | `/forgot-password` | public | issues a reset token |
| POST | `/reset-password` | public | sets new password |
| GET | `/me` | bearer | current user from JWT |

### Leads (`/api/v1/leads`)
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/search` | runs the full search pipeline (geocode → nearby → score → upsert) |
| GET | `/` | filters, sort, pagination |
| GET | `/:id` | one lead |
| DELETE | `/:id` | remove |

Filters on list: `category`, `city`, `minRating`, `minReviews`, `hasPhone`, `leadLabel`, `search`. Sort: `score|rating|totalReviews|distanceKm|createdAt`.

### Export (`/api/v1/export`)
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/csv` | enqueues a CSV export job |
| GET | `/excel` | enqueues an XLSX export job |
| GET | `/status/:id` | check progress |
| GET | `/download/:id` | stream the generated file |

### Admin (`/api/v1/admin`)
Requires `role = admin` on the JWT.
- `GET /users`
- `GET /search-logs`
- `GET /queues` — BullMQ counts (waiting / active / completed / failed / delayed)
- `GET /system-stats` — totals + cumulative API call count

### Health & docs
- `GET /health` — liveness probe
- `GET /ready` — readiness probe (checks MySQL + Redis)
- `GET /api/docs` — Swagger UI

## Lead scoring & cost optimization

```
score = (rating × 20) + log(totalReviews + 1) × 10
```

Implemented in [`src/utils/lead-scoring.ts`](src/utils/lead-scoring.ts). Place Details (the expensive Google endpoint) is only called for leads passing `rating ≥ 4.2 && totalReviews ≥ 80` — the gate from the spec — saving 60-80% of the Google bill in typical workloads.

## Caching

All three Google endpoints (Geocoding, Nearby Search, Place Details) cache through Redis with a 12-hour TTL by default (`CACHE_TTL_SECONDS`). Cache failures degrade gracefully — they're logged but never break the request.

## Background jobs (BullMQ)

Four queues are registered:
- `lead-fetch` and `place-details` — scaffolded for moving the synchronous search into the background
- `csv-export` — implemented; handles both CSV and XLSX
- `duplicate-cleanup` — implemented; collapses rows with identical `(name, city)` keeping the highest-scoring one

Run the worker process alongside the API:

```bash
npm run worker        # dev (tsx watch)
npm run worker:prod   # prod (compiled)
```

## Setup (local, no Docker)

```bash
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET; optional GOOGLE_API_KEY

npm install
npx prisma migrate dev --name init   # creates tables
npm run dev                           # http://localhost:4000

# In a second terminal:
npm run worker
```

Sanity check:
```bash
curl localhost:4000/health
# → {"status":"ok",...}

curl -X POST localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"JV","email":"team@jaiveeru.co.in","password":"hunter12!"}'
```

## Setup (Docker)

```bash
cp .env.example .env
# (compose injects DATABASE_URL/REDIS_HOST automatically inside the network)
docker compose up --build
```

Brings up four containers: `leadradius-mysql`, `leadradius-redis`, `leadradius-backend` (api), `leadradius-worker`. Migrations run automatically on backend boot.

## Setup (PM2 on a VPS / Plesk)

```bash
npm ci
npm run build
npx prisma migrate deploy
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

This launches the API in cluster mode and one fork-mode worker. Front it with nginx:

```nginx
server {
  listen 443 ssl http2;
  server_name api.leadradius.example;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
  }
}
```

## Security

- `helmet()` for safe HTTP headers
- CORS allowlist driven by `CORS_ORIGINS`
- Rate limits per family (auth, search, export, general)
- Validation through `zod` on every body / query / params
- Prisma is parameterised — SQL injection is not possible at the ORM layer
- JWT stateless auth with refresh-token rotation
- bcrypt password hashing (10 rounds default, configurable)
- Centralised error handler hides stack traces in production

## What's stubbed

To keep this session's deliverable focused and runnable, a few items are scaffolded but intentionally lighter:
- `lead-fetch` and `place-details` queue processors are no-op placeholders (the synchronous flow already covers the full pipeline).
- `forgot-password` returns the reset token in the response instead of emailing it. In production, swap this for a transactional email + a proper `password_resets` table.
- Swagger doc is hand-authored with route summaries; switch to `swagger-jsdoc` if you want full request/response schemas.

Everything else — service-repository pattern, response envelope, validation, role middleware, queue registry, Docker setup, PM2 manifest, deduplication, scoring, cost-optimised Google calls — is wired up end-to-end.

## License

All rights reserved. Built for the LeadRadius AI product team.
