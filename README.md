# VYOMA — Disaster Relocation Decision-Support System

VYOMA is a command-center / GIS ops-room tool that helps NDRF and district officials decide **where to relocate people from** (at-risk villages) and **where to relocate them to** (relocation sites). It is built for the Smart India Hackathon 2026 (Ministry of Home Affairs track).

The AI/ML model behind it is a village-level risk classifier (XGBoost) covering ~44,000 villages across 7 North-Eastern Indian states. It outputs, per village: a continuous risk score, a 3-tier risk bucket (RED/ORANGE/GREEN), a 4-tier relocation priority, SHAP-based top contributing factors, and a data-confidence flag.

> **⚠️ Current data status: mock/placeholder data.** The app runs on seeded demo data (16 villages, 8 relocation sites, Idukki district, Kerala) so the pipeline can be demonstrated end-to-end. Real model output will replace it — see [Replacing mock data with real data](#replacing-mock-data-with-real-data).

---

## Architecture

```
┌────────────────────────────┐        ┌──────────────────────────┐
│  Frontend (React + Vite)   │  HTTP  │  Backend (Express + TS)  │
│  src/                      │ ─────► │  server/src/             │
│  TanStack Query + apiFetch │        │  REST API (REST /api/…)  │
└────────────────────────────┘        └───────────┬──────────────┘
                                                  │ Prisma
                                         ┌────────▼──────────────┐
                                         │  PostgreSQL (Neon)    │
                                         │  Village + Site tables│
                                         └───────────────────────┘
```

- **Frontend** — React 18 + Vite + Tailwind CSS. Dark, disciplined, instrument-panel UI. Data fetching via TanStack Query through a single `apiFetch` client; the API base URL lives in `VITE_API_URL` (never hardcoded).
- **Backend** — Node.js + Express + TypeScript + Prisma ORM against a Neon-hosted PostgreSQL database. Serves the exact JSON shapes the frontend expects.
- **Seed** — `server/src/seed.ts` reads the frontend's `mockData/*.json` files and upserts them into PostgreSQL, so demo data is identical across DB and UI.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 7 |
| Data fetching | TanStack Query (React Query) |
| Charts | Recharts |
| GIS Map | MapLibre GL JS |
| Backend | Node.js, Express 4, TypeScript |
| ORM / DB | Prisma, PostgreSQL (Neon-hosted) |

---

## Project Structure

```
Vyoma/
├── src/                          # Frontend
│   ├── App.jsx                   # Routes, providers, layout shell
│   ├── main.jsx / index.css      # Entry + global styles (tokens, fonts, keyframes)
│   ├── components/
│   │   ├── layout/               # Sidebar, TopBar (state/district selectors)
│   │   ├── dashboard/            # StatsRow, CriticalHabitationsTable, MapPanel,
│   │   │                         # RelocationPrioritySummary, RelocationSiteCapacity, KanbanBoard
│   │   └── ui/                   # GisMap, KanbanCard, StatCard, ProgressBar, Icon,
│   │                             # SkeletonLoader, ErrorState, MapFilterButton, MapToolButton
│   ├── pages/                    # One file per route (11 pages)
│   ├── context/                  # SelectionContext (global State/District selection)
│   ├── lib/                      # api.js (API client)
│   └── ...
├── server/                       # Backend (standalone Node project)
│   ├── src/
│   │   ├── index.ts              # Express server (port 3001)
│   │   ├── seed.ts               # Seeds DB from mockData/*.json
│   │   ├── lib/prisma.ts         # Prisma client singleton
│   │   └── routes/               # villages.ts, sites.ts, dashboard.ts
│   └── prisma/schema.prisma      # Village + RelocationSite models
├── mockData/                     # Demo data (seeded into the DB)
│   ├── habitations.json          # 16 villages
│   └── relocationSites.json      # 8 sites
├── phase-0-design.md             # Design spec — governs all visual/UX decisions
└── .env                          # Frontend env (VITE_API_URL)
```

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Stat cards, critical habitations, embedded GIS map, priority summary, site capacity |
| `/map` | Hazard Map | Full-page MapLibre map: heatmap + markers, risk filters, search, popups, legend |
| `/villages` | Villages | Sortable/filterable table of all villages (API-side filters) |
| `/villages/:id` | Village Details | Risk assessment, top contributing factors, low-confidence badge, recommended site |
| `/priority` | Relocation Priority | 4-lane kanban (IMMEDIATE / SHORT-TERM / MEDIUM-TERM / ROUTINE) |
| `/sites` | Relocation Sites | Sortable/filterable site table with infrastructure checklist |
| `/capacity` | Carrying Capacity | Site utilization bars with threshold coloring |
| `/analytics` | Analytics | Recharts: risk distribution, priority, score histogram, population at risk |
| `/help` | Help | About VYOMA, model info, navigation guide |
| `/logout` | Logout | Placeholder (auth not yet implemented) |
| `*` | 404 | Catch-all with return link |

---

## Design System (summary)

Full spec lives in **`phase-0-design.md`** — every visual decision should defer to it. Highlights:

**Severity colors** (risk level + priority + status):
- RED / IMMEDIATE → `#DC2626`
- SHORT-TERM priority → `#EA580C`
- ORANGE risk / MEDIUM-TERM → `#D97706`
- GREEN / ROUTINE → `#16A34A`

> Risk level uses 3 buckets (RED/ORANGE/GREEN); priority uses 4 tiers. They're different scales — never conflate the mappings.

**Radius:** `rounded-[4px]` cards/panels, `rounded-[6px]` inputs, `rounded-[2px]` badges/buttons. No `rounded-lg`/`rounded-xl`.

**Backgrounds:** base `#0B0E14`, elevated `#12151C`, card `#1A1E28`. Text: primary `#E8EAED`, secondary `#9CA3AF`.

**Typography:** monospace (JetBrains Mono) for IDs, coordinates, scores, numbers; sans (Geist) for labels and body.

**Map:** risk-colored markers, RED pulse halo, risk-density heatmap at low zoom (crossfades to markers above ~zoom 11.5), search fly-to, click-to-popup → navigate to village details. Marker rendering uses a native MapLibre GeoJSON circle layer (no HTML markers).

---

## Data Model

### Village (`mockData/habitations.json` → `prisma/schema.prisma`)

```ts
interface Village {
  village_id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  risk_score: number;              // continuous 0.0–1.0
  risk_level: "RED" | "ORANGE" | "GREEN";
  relocation_priority: "IMMEDIATE" | "SHORT-TERM" | "MEDIUM-TERM" | "ROUTINE";
  vulnerability_multiplier: number;
  top_factors: { feature: string; value: string; impact: "high" | "medium" | "low" }[];
  low_confidence: boolean;
  recommended_site_id: string | null;
  prediction_timestamp: string;
  model_version: string;
}
```

### RelocationSite (`mockData/relocationSites.json`)

```ts
interface RelocationSite {
  site_id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  suitability_score: number;       // 0–100
  total_capacity: number;
  occupied: number;
  available: number;
  infrastructure: {                 // all booleans
    water_supply: boolean; electricity: boolean; road_access: boolean;
    shelter: boolean; medical_facility: boolean; sanitation: boolean;
  };
}
```

`top_factors` and `infrastructure` are stored as Prisma `Json` fields (no relational tables). `risk_score` is always a 0.0–1.0 decimal — never displayed as an integer.

---

## Setup

### Prerequisites

- Node.js 18+
- A PostgreSQL database (the project targets **Neon** — free serverless Postgres) — *only needed for the backend*

### 1. Frontend

```bash
npm install
cp .env.example .env   # if present; otherwise create .env with VITE_API_URL
npm run dev            # http://localhost:5173
```

Frontend env (`./.env`):

```
VITE_API_URL=http://localhost:3001
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env` with your real Neon connection string:

```
DATABASE_URL="postgresql://user:password@your-neon-host/dbname?sslmode=require"
```

Then, in order:

```bash
# 1. Create the tables
npx prisma migrate dev --name init

# 2. Seed with the existing demo data (16 villages, 8 sites)
npm run seed

# 3. Start the API server
npm run dev            # http://localhost:3001
```

### 3. Run both

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
npm run dev
```

Open `http://localhost:5173`. If the backend isn't running, pages show the app's `ErrorState` ("Data could not be loaded…") with a retry button — that's expected behavior, not a bug.

---

## API Endpoints

| Endpoint | Description | Query Params |
|---|---|---|
| `GET /api/villages` | List all villages | `?district=`, `?state=`, `?risk_level=`, `?relocation_priority=` |
| `GET /api/villages/:id` | Single village by `village_id` | — |
| `GET /api/sites` | List all relocation sites | `?district=`, `?state=` |
| `GET /api/sites/:id` | Single site by `site_id` | — |
| `GET /api/dashboard` | Aggregate stats (risk counts, priority counts, population at risk, site capacity) | `?district=`, `?state=` |
| `GET /api/health` | Health check | — |

Responses are shaped exactly like the frontend's mock files, so the frontend never needs data-shape translation.

---

## Replacing mock data with real data

The whole pipeline is built so this swap is a data change, not a code change:

1. **Shape check first** — the real model output must match the `Village` / `RelocationSite` interfaces above (field names are contractual).
2. **Replace the files** `mockData/habitations.json` and `mockData/relocationSites.json` with real data (same JSON shape), then re-seed:
   ```bash
   cd server && npm run seed
   ```
3. **Or load directly into the DB** (any SQL client / script) — the API reads from PostgreSQL, not the JSON files, so the frontend picks it up automatically on next fetch.

Notes for when real data lands:
- The **GIS map** renders whatever villages the API returns — no map-specific data files exist.
- **Clustering** was intentionally removed for the demo dataset (16 villages). With the real ~830-village Mizoram dataset (or any district with >50 visible points), clustering should be rebuilt using MapLibre's native cluster layers.
- **State/District selectors** already filter everything via API query params — as soon as real data spans multiple states/districts, the cascading selection works against it as-is.
- If the real model output introduces fields not in the schema (e.g. hazard-type breakdowns), `schema.prisma` + the seed script need a small extension — the UI components for such data don't exist yet and shouldn't be assumed.

---

## Common Issues

| Problem | Fix |
|---|---|
| Pages show "Data could not be loaded" | Backend not running — start `cd server && npm run dev` |
| Map worker error in Vite | Already handled: `optimizeDeps.exclude: ['maplibre-gl']` in `vite.config.js`; if it recurs, delete `node_modules/.vite` and restart |
| `DATABASE_URL` placeholder | Replace it in `server/.env` with a real Neon connection string before `prisma migrate` / `seed` |
| `.env` not picked up | Restart the dev server after creating/editing `.env` files |

---

## Scripts

| Where | Command | What |
|---|---|---|
| root | `npm run dev` | Start Vite frontend dev server |
| root | `npm run build` | Production build of frontend |
| root | `npm run preview` | Preview the production build |
| server | `npm run dev` | Run API server (tsx watch) |
| server | `npm run build` | Compile TypeScript |
| server | `npm run seed` | Seed DB from `mockData/*.json` |
| server | `npm run migrate` / `npm run migrate:prod` | Run Prisma migrations (dev / deploy) |