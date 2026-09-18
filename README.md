# AstroTrue — What's really in your stars

Next.js 16 app that computes real Vedic birth charts (Swiss Ephemeris, Lahiri ayanamsa), asks Gemini for a
balanced plain-language reading, stores the **structured** result in Supabase, and serves it at a
shareable URL. Also does Ashta Koota (36-guna) kundali matching with every factor explained.

```
User input → chart (TS) → Gemini (JSON schema) → structured report → Supabase → UI / share link / print
```

## Requirements

- Node 22+, pnpm 9+
- A Supabase project (free tier is fine)
- A Google Gemini API key

## Setup

```bash
pnpm install
cp .env.example .env         # then fill in the values below
```

`.env`:

```
GEMINI_API_KEY=...                       # https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.5-flash            # optional
SUPABASE_URL=https://xxxx.supabase.co    # Project Settings → API
SUPABASE_SERVICE_ROLE_KEY=...            # service_role key — server-side only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Create the tables once: open the Supabase **SQL Editor**, paste `supabase/migrations/001_init.sql`, run.
Row-level security is on with no policies, so the anon key cannot read reports; only the server can.

## Run

```bash
pnpm dev          # http://localhost:3000
pnpm test         # vitest — astro engine is checked against fixtures/python_reference.json
pnpm typecheck
pnpm build && pnpm start
```

## Routes

| Route | What |
|---|---|
| `/` | Landing page |
| `/app` | Birth report form |
| `/<name-slug>` | A person's report, e.g. `/rahul-sharma` (duplicates get `-2`, `-3`…) |
| `/report/<uid>` | Public share link for the same report (UID is the real identity) |
| `/match` | Kundali matching form |
| `/match/<uid>` | Compatibility report |
| `POST /api/reports` | Create a report → `{ uid, slug }` |
| `POST /api/match` | Create a match → `{ uid }` |
| `GET /api/geocode?q=` | City suggestions |

Reports are never regenerated when a URL is opened — pages read the stored structured report.
"Download PDF" uses the browser's print dialog with a dedicated print stylesheet.

## Project layout

```
app/            routes (App Router)
components/     ui primitives, forms, report + match views, landing
src/astro/      chart, nakshatras, dasha, D10, Ashta Koota — ported from the original Python
src/ai/         Gemini client, per-pillar response schemas, prompts
src/reports/    Zod types, builders (AI → structured), pillars, slugs
src/db/         Supabase client + repository (server only)
src/i18n/       English / Hindi copy
supabase/       SQL migration
fixtures/       reference output from the original Python engine, used by tests
```
