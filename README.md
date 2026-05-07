# LeadRadius AI — Frontend Prototype

A polished Next.js 15 + React 19 + Tailwind frontend for **LeadRadius AI**, an AI-powered local business lead intelligence platform. It demonstrates the full UX of the product described in the spec — auth, dashboard analytics, radius search, scored lead table, and CSV export — without requiring a backend to run.

The app uses realistic mock data by default, and ships with the real Google Places integration code wired up behind an env flag so you can switch to live data when you have an API key.

## What's built

- **Authentication** — Login + Register with a mock JWT flow. Sessions persist in `localStorage`.
- **Dashboard** — Stat cards, lead-quality donut, daily searches area chart, leads-by-category and leads-by-city bars, API usage panel, top-leads strip. Powered by Recharts and animated with Framer Motion.
- **Radius search** — Location, radius slider (5–100 km), category, min rating/reviews, "phone required" toggle, animated multi-step search progress.
- **Lead table** — TanStack Table with sorting, global filter, pagination, bulk row selection, label-coded quality chips, score bars, copy-on-click phone numbers, CSV export of either the filtered set or the selected rows.
- **AI scoring** — `score = rating × 20 + log(reviews + 1) × 10`, bucketed into Premium / High Potential / Medium / Low Priority.
- **Cost optimization** — The integration only calls the expensive Place Details endpoint for leads that pass `rating ≥ 4.2 && reviews ≥ 80`, mirroring the spec.
- **Luxury dark UI** — Glassmorphism cards, brand gradients, grid background, subtle glow shadows, polished focus states.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19, Tailwind CSS, Framer Motion, Lucide icons |
| Data table | `@tanstack/react-table` v8 |
| Charts | `recharts` |

## Getting started

```bash
# 1. Install
npm install

# 2. (Optional) configure env
cp .env.example .env.local

# 3. Run the dev server
npm run dev
# → http://localhost:3000
```

The app redirects `/` to `/dashboard`. Sign in at `/login` (any email + password works in the prototype).

## Adding your Google Places API key

The mock data lets the app run immediately. When you're ready to use real Google data:

1. Create a key at https://console.cloud.google.com/google/maps-apis (enable **Places API**, **Geocoding API**).
2. Set both env vars in `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_API_KEY=AIza…
   NEXT_PUBLIC_USE_LIVE_PLACES=true
   ```
3. Restart `npm run dev`. Searches now hit Google.

> **Production caveat:** `NEXT_PUBLIC_*` vars are exposed to the browser. For real deployments, move `lib/google-places.ts` behind a Next.js Route Handler (`app/api/leads/search/route.ts`) and call it server-side so the key stays private. The integration code in this repo is shaped to make that move trivial.

## File tree

```
app/
  (auth)/
    layout.tsx          ← split-screen auth shell
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx          ← sidebar + navbar
    dashboard/page.tsx  ← analytics overview
    search/page.tsx     ← radius search
    leads/page.tsx      ← lead table + CSV export
  globals.css
  layout.tsx
  page.tsx              ← redirects to /dashboard

components/
  ui/                   ← Button, Card, Input/Label, Badge, Slider, Switch, Select
  layout/               ← Sidebar, Navbar
  dashboard/            ← StatCard, charts (Recharts)
  leads/                ← SearchForm, LeadTable

lib/
  types.ts              ← BusinessLead, SearchParams, LeadLabel
  utils.ts              ← cn(), CSV export, haversine, formatters
  lead-scoring.ts       ← score formula, label buckets, label styles
  google-places.ts      ← real Geocode/Nearby/Details integration (env-gated)
  mock-data.ts          ← deterministic mock generator + SEED_LEADS
  lead-store.ts         ← localStorage bridge between /search and /leads
  auth.ts               ← mock JWT session helpers
```

## What's intentionally **not** built (yet)

The spec describes a full SaaS platform. This prototype is a focused frontend slice. The following pieces are **not** in this codebase and would be the natural next step:

- Real backend (Express + MySQL + BullMQ + Redis)
- Server-side Google Places proxy + caching
- `/api/auth/*` routes with bcrypt + JWT refresh
- `/leads/[id]` detail page with Maps embed + reviews
- Background queue dashboard
- PDF/Excel exporters (CSV is implemented)
- Outreach module (WhatsApp, SMS, Email, Call logs)
- Admin panel
- Docker compose, nginx, PM2

Each was scoped out for this session in favor of shipping a polished, runnable UI. The interfaces in `lib/types.ts` and the integration shape in `lib/google-places.ts` are designed to let you drop in real backend calls without rewriting the UI.

## Demo notes

- The demo email `team@jaiveeru.co.in` is pre-filled in the login form. Anything works.
- Use `admin@leadradius.io` to get the `admin` role on the session object.
- Refreshing `/leads` keeps your most recent search results because they're persisted to `localStorage` via `lib/lead-store.ts`.
- The progress bar on the search form is a UX nicety — even on mock data it walks through the same stages a real search would.

## License

All rights reserved. Built for the LeadRadius AI product team.
