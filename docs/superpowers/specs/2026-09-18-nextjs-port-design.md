# Kundali App — Next.js Port & Product Redesign (Design Spec)

Date: 2026-09-18 · Status: approved for implementation

## Goal

Port the Flask/Jinja Vedic Kundali app to a single **Next.js 16 (App Router, TypeScript)** codebase and
implement every requirement in `next.md`: Supabase as the source of truth, UID-based reports with
name-based routes, public share links, print-to-PDF, balanced AI insights, correct focus-pillar filtering,
astrology-themed loaders, redesigned matching, a landing page, and a full UI redesign. No regressions in
chart math: TS output must match the Python engine.

## Decisions (made with the user)

| Decision | Choice |
|---|---|
| Stack | Next.js 16, App Router, TypeScript, Tailwind v4, no extra UI kit |
| Calc engine | Full TS port; Swiss Ephemeris via `sweph` (native, Moshier flag, Lahiri) |
| Persistence | Supabase (existing project), server-side only via service-role key |
| PDF | Browser print-to-PDF via dedicated print stylesheet + "Download PDF" → `window.print()` |
| AI | Gemini via `@google/genai`, JSON mode with `responseSchema` built per selected pillars |
| Matching reports | Also persisted with their own UID and `/match/<uid>` route |
| Package manager | pnpm |

## Architecture

```
Input form → /api/reports (POST) → chart.ts → gemini → buildPersonReport() → Supabase → redirect /<slug>
/<slug>            → server component: repo.getBySlug → render StructuredReport
/report/<uid>      → server component: repo.getByUid  → render StructuredReport (public, no regen)
/match/<uid>       → server component: repo.getMatch  → render MatchReport
```

The UI only ever renders `PersonReport` / `MatchReport` TypeScript types (Zod-validated). Raw AI JSON
never reaches a component.

### Folder structure

```
app/
  layout.tsx  page.tsx (landing)  loading.tsx  not-found.tsx  globals.css
  app/page.tsx                      report form
  match/page.tsx                    match form
  match/[uid]/page.tsx  loading.tsx
  report/[uid]/page.tsx loading.tsx
  [slug]/page.tsx loading.tsx       name route (last — reserved paths win)
  api/reports/route.ts              POST create person report
  api/match/route.ts                POST create match report
  api/geocode/route.ts              GET ?q= city lookup
src/
  astro/    signs.ts nakshatras.ts dasha.ts d10.ts chart.ts matching.ts timezone.ts  (+ __tests__)
  ai/       client.ts schemas.ts prompts/person.ts prompts/match.ts
  reports/  types.ts (Zod) buildPerson.ts buildMatch.ts pillars.ts slug.ts
  db/       supabase.ts (client) repo.ts (all queries)
  i18n/     en.ts hi.ts index.ts
  lib/      env.ts errors.ts cities.ts
components/
  ui/        Button Card Badge Chip Meter Section Loader(CosmicLoader) ErrorState EmptyState
  landing/   Hero HowItWorks Features ExampleInsights Trust Footer
  forms/     PersonFields CityAutocomplete TimeToggle PillarPicker ReportForm MatchForm
  report/    ReportHeader NorthChart CoreCards DashaTimeline PillarSection InsightList Remedies ShareBar
  match/     MatchHeader ScoreMeter FactorCard MangalCard ComparisonGrid
supabase/migrations/001_init.sql
```

## Data model (Supabase)

`person_reports`: `uid uuid pk default gen_random_uuid()`, `slug text unique not null`, `name text`,
`birth jsonb`, `profile jsonb`, `pillars text[]`, `chart jsonb`, `insights jsonb`, `language text`,
`created_at timestamptz default now()`. Index on `slug`.

`match_reports`: `uid uuid pk`, `boy jsonb`, `girl jsonb`, `guna jsonb`, `factors jsonb`, `insights jsonb`,
`language text`, `created_at`.

RLS enabled on both, **no policies** → anon key cannot read; only the server (service role) can.
Public share pages are served by the Next.js server, which strips internal fields (`created_at`, raw
longitudes are fine; nothing sensitive is stored).

## Structured report types (src/reports/types.ts)

```ts
type Pillar = "career" | "love" | "health" | "wealth";
type Insight = { text: string; kind: "positive" | "concern" | "neutral" };
type PersonReport = {
  uid: string; slug: string; name: string; language: "en" | "hi";
  birth: { dob; time; timeKnown; city; state; country; lat; lon };
  profile: { gender; occupation; maritalStatus };
  pillars: Pillar[];                     // selected
  chart: ChartSummary;                   // lagna, rashi, nakshatra, d1, houseOf, d10Lagna, dasha, mangal
  core: { soulPurpose; overview: Insight[]; dashaAnalysis; remedies: Remedy[] };
  sections: Partial<Record<Pillar, PillarSection>>;  // ONLY selected pillars present
  createdAt: string;
};
type PillarSection = { summary: string; positives: string[]; concerns: string[]; extras: Record<string, unknown>; timeline?: {period; desc}[] };
```

`buildPersonReport()` is the single place that (a) drops any pillar not selected, (b) normalises AI
output into positives/concerns, (c) guarantees empty `concerns` stays `[]` (never fabricated). Web,
share page and print all consume the same object → filtering is consistent everywhere (#10).

## Pillar filtering & balanced AI (#1, #10)

- `PillarPicker`: multi-select chips; "All" toggles all four. Sent as `pillars: Pillar[]`.
- `schemas.ts` builds the Gemini `responseSchema` containing only the selected pillars, so unselected
  sections are never generated. Prompt instructs: positives/concerns per section, "concerns may be an
  empty list when none genuinely exist — never invent one", plain language, no repetition.
- Renderer hides the Concerns block when empty.

## Routing (#9, #11, #12, #13)

- Slug = NFKD-normalised, lowercased, `[^a-z0-9]+ → -`, trimmed; empty → `person`. Reserved
  (`app match report api _next static favicon.ico`) get `-1`. Duplicates get `-2`, `-3`… (checked in repo).
- Slug is a lookup key; UID is the identity. `/report/<uid>` never depends on slug.
- Navigation is URL-driven with Next.js router (`router.push('/<slug>')`); Back/Forward are native;
  each route's `loading.tsx` shows the cosmic loader. No localStorage for reports (only `theme`, `lang`).
- Invalid uid/slug → `notFound()` → "We couldn't find this astro report." + CTA to `/app`.

## UI system (#3, #5, #6, #7, #8)

- Tokens: night-indigo surfaces, warm gold accent, parchment light theme; fonts Cormorant Garamond
  (display) + Inter (body) via `next/font`. `prefers-color-scheme` + manual toggle.
- `CosmicLoader({ message })`: orbiting moon around a thin ring + faint constellation dots; messages by
  context: "Mapping your cosmic insights…", "Reading your astro profile…", "Comparing your charts…",
  "Preparing your compatibility report…", "Preparing your astro profile…".
- Every async flow: loading / empty / error (plain message + Retry) / not-found.
- Matching page: two-person header, `ScoreMeter` (x/36), one `FactorCard` per koota with verdict badge
  (Strength / Concern / Neutral), plain-English meaning, side-by-side values; Mangal Dosha card; AI
  strengths/challenges/guidance.
- Landing: Hero, value prop, How it works, Reports, Matching, Example insights, Features, Trust, Footer.
- Print: `@media print` stylesheet hides nav/loader/buttons, forces light palette, page-breaks per section.
- Copy rewritten to be plain and friendly; EN + HI dictionaries kept.

## Error handling

- Env validated at startup (`src/lib/env.ts`, Zod) — missing keys fail fast with a clear message.
- API routes: Zod-validate body → 400; Gemini quota → 429 with friendly text; unknown → 500 generic;
  details logged server-side only.
- Gemini JSON: one retry on parse failure, then a typed error (no partial report saved).

## Testing

Vitest: `astro/*` against fixtures captured from the Python engine (chart for 1990-05-15 10:30 Delhi;
guna milan for two fixed charts), `slug.ts`, `pillars.ts`, `buildPerson.ts` (filtering, empty concerns).
Manual e2e against real Supabase: create → `/<slug>` → `/report/<uid>` → Back/Forward → print → match.

## Out of scope

Authentication, user accounts, report editing/deletion UI, server-side PDF rendering.
