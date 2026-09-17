# Next.js Port & Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Flask app with a Next.js 16 TypeScript app that persists structured reports to Supabase and implements every requirement in `next.md`.

**Architecture:** App Router with server components for report pages (`/[slug]`, `/report/[uid]`, `/match/[uid]`) reading from a Supabase repository; Route Handlers for creation (`/api/reports`, `/api/match`) that run the TS astro engine, call Gemini in JSON mode with a per-pillar schema, and normalise into `PersonReport`/`MatchReport` via builders. UI renders only these structured types.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, `sweph`, `geo-tz`, `luxon`, `@google/genai`, `@supabase/supabase-js`, `zod`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-18-nextjs-port-design.md`

## Global Constraints

- pnpm; Node 22. Native dep `sweph` must be marked `serverExternalPackages` in `next.config.ts`.
- Chart math must match `fixtures/python_reference.json` (signs, nakshatra, pada, houses, D10, dasha lords/months, guna points) — Moshier flag + Lahiri.
- No report data in localStorage (only `theme`, `lang`).
- Supabase accessed only server-side with `SUPABASE_SERVICE_ROLE_KEY`; never import `src/db/*` from client components.
- Every async UI flow has loading (CosmicLoader with contextual message), empty, error (+Retry), not-found.
- Copy: plain, friendly, short. EN + HI.
- Commit after each task with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

### Task 1: Scaffold Next.js app + tooling
**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `app/layout.tsx`, `app/globals.css`, `.env.example`, `.gitignore`
- [ ] `pnpm create next-app@latest . --ts --tailwind --app --src-dir=false --import-alias "@/*" --no-eslint` (into a temp dir, then move into repo root; keep `fixtures/`, `docs/`, Python files until Task 12)
- [ ] Add deps: `sweph geo-tz luxon @google/genai @supabase/supabase-js zod`; dev: `vitest @types/luxon`
- [ ] `next.config.ts`: `serverExternalPackages: ["sweph", "geo-tz"]`
- [ ] `vitest.config.ts` with `@` alias; `"test": "vitest run"` script
- [ ] `.env.example`: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- [ ] Verify `pnpm build` passes; commit

### Task 2: Astro engine — signs, nakshatras, D10, dasha (TDD vs fixtures)
**Files:** `src/astro/signs.ts`, `nakshatras.ts`, `d10.ts`, `dasha.ts`, `src/astro/__tests__/core.test.ts`
**Produces:** `SIGNS`, `SIGN_LORDS`, `getSign(lon)`, `getNakshatra(lon): {name,lord,deity,index,pada,degree}`, `getD10Sign(lon)`, `getVimshottariDasha(moonLon, birthDate: Date, today?: Date): Dasha`
- [ ] Test: for each fixture chart, `getSign(longitudes[p]) === d1[p]`, `getNakshatra(moon).name/pada` match, `getD10Sign` matches `d10`, dasha `all_mahadashas[i].lord/start/end` match (format `MMM yyyy`, use Luxon UTC). Test dasha with a frozen `today` = fixture generation date 2026-09-18.
- [ ] Implement; run; commit

### Task 3: Astro engine — timezone, chart, matching
**Files:** `src/astro/timezone.ts`, `chart.ts`, `matching.ts`, `summary.ts`, `__tests__/chart.test.ts`, `__tests__/matching.test.ts`
**Produces:** `localToUtc(dob, time, lat, lon): DateTime`, `computeChart(dob, time, lat, lon): Chart`, `computeGunaMilan(a, b): Guna`, `checkMangalDosha(chart)`, `buildChartSummary(chart): string`
- [ ] Test chart against 4 fixtures: `lagna`, `rashi`, `sun_sign`, `nakshatra.name/pada`, `d1`, `d10`, `house_of`, `d10_lagna`, `utc_time`, `ayanamsa` (±1e-4), `lagna_degree` (±0.01)
- [ ] Test guna against 2 fixtures: `total`, every koota `points`, dosha count; mangal `is_manglik`
- [ ] Implement with `sweph` (`SEFLG_SIDEREAL|SEFLG_MOSEPH`, `set_sid_mode(SE_SIDM_LAHIRI)`, `houses_ex(jd, flag, lat, lon, 'P')`); commit

### Task 4: Report types, pillars, slug, builders (TDD)
**Files:** `src/reports/types.ts`, `pillars.ts`, `slug.ts`, `buildPerson.ts`, `buildMatch.ts`, `__tests__/*.test.ts`
**Produces:** Zod schemas `PersonReportSchema`, `MatchReportSchema`; `ALL_PILLARS`, `normalizePillars(input: unknown): Pillar[]` (empty/invalid → all four); `toSlug(name)`, `nextSlug(base, taken: string[])`; `buildPersonReport({uid, slug, input, chart, ai, pillars}): PersonReport`; `buildMatchReport(...)`: factors per koota with `verdict: "strength"|"concern"|"neutral"` (points/max ≥ 0.75 strength, 0 or dosha concern, else neutral) + `meaning` plain-English text per koota
- [ ] Tests: slug of `"Rahul Sharma"` → `rahul-sharma`; `"  Rāhul!! "` → `rahul`; reserved `"app"` → `app-1`; `nextSlug("rahul",["rahul","rahul-2"])` → `rahul-3`. `normalizePillars(["career"])` → `["career"]`; `normalizePillars([])` → all. `buildPersonReport` with `pillars:["career"]` and AI containing `love` → `sections` has only `career`; AI concerns `[]` stays `[]`.
- [ ] Implement; commit

### Task 5: AI layer
**Files:** `src/ai/client.ts`, `schemas.ts`, `prompts/person.ts`, `prompts/match.ts`, `__tests__/schemas.test.ts`
**Produces:** `generateJson<T>(prompt, system, schema): Promise<T>` (temperature 0, JSON mime, one retry, throws `AiError{code:"quota"|"parse"|"unknown"}`); `buildPersonSchema(pillars, relationshipStatus)`; `MATCH_SCHEMA`; `personPrompt(...)`, `matchPrompt(...)`
- [ ] Test: schema for `["career"]` has `career` property and no `love/health/wealth`; every pillar section has `positives` & `concerns` arrays
- [ ] Port prompts; add balance instructions ("concerns may be empty; never invent") and plain-language rules; model `gemini-2.5-flash` (env override `GEMINI_MODEL`); commit

### Task 6: Supabase repository + migration
**Files:** `supabase/migrations/001_init.sql`, `src/db/supabase.ts`, `src/db/repo.ts`, `src/lib/env.ts`
**Produces:** `repo.createPerson(report)`, `repo.getPersonBySlug(slug)`, `repo.getPersonByUid(uid)`, `repo.listSlugsLike(base)`, `repo.createMatch(report)`, `repo.getMatchByUid(uid)`; all return parsed Zod types or `null`
- [ ] Write SQL (tables, RLS enabled, index on slug); env Zod validation; repo with `import "server-only"`
- [ ] Run migration in user's Supabase (user pastes SQL); commit

### Task 7: API routes
**Files:** `app/api/reports/route.ts`, `app/api/match/route.ts`, `app/api/geocode/route.ts`, `src/lib/cities.ts`, `src/lib/errors.ts`
- [ ] POST /api/reports: Zod body → coords (from body or cities list; fallback Nominatim) → `computeChart` → `generateJson` → `buildPersonReport` → `repo.createPerson` → `{uid, slug}`. Errors: 400 validation, 429 quota, 500 generic (log details)
- [ ] POST /api/match similar → `{uid}`; GET /api/geocode?q= → top 8 cities
- [ ] Smoke with curl; commit

### Task 8: Design system + UI primitives + loader
**Files:** `app/globals.css` (tokens, dark/light, print), `components/ui/*`, `components/ui/CosmicLoader.tsx`, `components/ThemeToggle.tsx`, `components/LangToggle.tsx`, `src/i18n/*`
- [ ] Tokens, fonts (`next/font`: Cormorant Garamond + Inter), `Button`, `Card`, `Badge`, `Chip`, `Meter`, `Section`, `ErrorState`, `EmptyState`, `CosmicLoader` (CSS-only orbit animation, `prefers-reduced-motion` respected); i18n context with EN/HI
- [ ] Commit

### Task 9: Landing page
**Files:** `app/page.tsx`, `components/landing/*`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx`
- [ ] Hero, value prop, How it works, Reports, Matching, Example insights, Features, Trust, Footer; CTAs → `/app`, `/match`
- [ ] Commit

### Task 10: Report form + report pages
**Files:** `app/app/page.tsx`, `components/forms/*`, `app/[slug]/page.tsx`+`loading.tsx`, `app/report/[uid]/page.tsx`+`loading.tsx`, `app/not-found.tsx`, `components/report/*`
- [ ] Form (client): fields, `CityAutocomplete` (`/api/geocode`), `TimeToggle`, `PillarPicker` chips; submit → show `CosmicLoader("Mapping your cosmic insights…")` → `router.push('/'+slug)`; error state with Retry
- [ ] `[slug]` and `report/[uid]` server pages: `repo.get…` → `notFound()` or `<ReportView report/>`; `loading.tsx` = `CosmicLoader("Reading your astro profile…")`
- [ ] `ReportView`: header, `NorthChart` SVG, core cards, dasha timeline, per selected pillar `PillarSection` (summary, Strengths list, Concerns list hidden when empty, extras), remedies, `ShareBar` (copy `/report/<uid>` link, "Download PDF" → `window.print()`)
- [ ] Print CSS; commit

### Task 11: Match form + match report page
**Files:** `app/match/page.tsx`, `components/forms/MatchForm.tsx`, `app/match/[uid]/page.tsx`+`loading.tsx`, `components/match/*`
- [ ] Two-person form → loader "Comparing your charts…" → `router.push('/match/'+uid)`
- [ ] `MatchView`: header, `ScoreMeter`, `FactorCard` ×8 (verdict badge, meaning, side-by-side), Mangal card, AI strengths/challenges/guidance/remedies, share + print
- [ ] Commit

### Task 12: Cleanup, README, verification
- [ ] Remove Flask files (`main.py chart.py planets.py matching.py templates/ requirements.txt .venv` from git; keep `fixtures/`), update `README.md` (setup, env, Supabase migration, run), `.gitignore`
- [ ] `pnpm test`, `pnpm build`, `pnpm dev` e2e: create report → `/<slug>` → share link → back/forward → print preview → match; commit
