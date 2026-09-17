# Prediction Engine, Information Architecture & Guided Form (Design Spec)

Date: 2026-09-18 · Status: approved · Implements `roadmap.md` (Parts 1, 1B, 1C, 2) for BOTH marriage and career.

## Engine (`src/astro/`)
- `precise.ts`: `toDMS(deg)`, `PlanetDetail { lon, sign, degInSign, dms, nakshatra, pada, retrograde, house }` for all bodies + Lagna; `houseLord(house, lagnaSign)`, `houseLords(chart)`.
- `dignity.ts`: tables (exaltation/debilitation degree, own, moolatrikona range, friends/enemies); `getDignity(planet, sign, deg)`; `isCombust(planet, planetLon, sunLon)` with per-planet orbs (Moon 12, Mars 17, Mercury 14/12R, Jupiter 11, Venus 10/8R, Saturn 15).
- `strength.ts`: 0–100 = dignity (0–40) + house class (kendra/trikona/dusthana, 0–25) + benefic aspects received (0–20) + retro/combust penalties + own-nakshatra bonus. `confidenceBand(score) → "direct" | "moderate" | "soft"`.
- `aspects.ts`: full-house drishti; returns `{ from, toHouse, toPlanets[] }[]`.
- `varga.ts`: `getD9Sign(lon)`, `getD7Sign(lon)`; `vargaChart(chart, "D9")`.
- `yogas.ts`: `Yoga { key, name, kind: "yoga"|"dosha"|"rajayoga", present, cancelled, cancellationReasons[], grade: 1–3, participants[], houses[], activeInDasha, summary }`; functions: gajakesari, kemadruma, budhaditya, chandraMangal, dhana, manglik (cancellations: Mars own/exalted, Mars with/aspected by Jupiter, Mars in Aries/Scorpio/Capricorn in 1/4/7/8/12 specifics, Mars in 2nd in Gemini/Virgo, etc.), kendraTrikona, viparita, neechaBhanga, dharmaKarmadhipati; `detectYogas(chart) → Yoga[]` ranked (rajayoga → grade → activeInDasha).
- `transits.ts`: `computeTransits(chart, date)` → each planet's transit sign/house from Lagna and Moon, Sade Sati phase, `hits[]` (conjunct/aspecting natal planets within 3°) and `intersections[]` with current dasha lords.

## Rules (`src/rules/`)
- `types.ts`: `Condition` union: `planetInHouse | planetInSign | planetDignity | houseLordInHouse | houseLordDignity | yoga | aspect | dashaLord | vargaPlanetInSign | planetStrength`. `Rule { id, domain, conditions[], weight: 1–3, positive: boolean, text }`.
- `marriage.json` (≈18 rules), `career.json` (≈18 rules) — sourced from BPHS-style classical combinations, multi-condition.
- `engine.ts`: `evaluate(facts, rules) → FiredRule { rule, confidence, phrasedText }` where phrasing prefix depends on min planet strength among participants.

## Facts → AI → Report
- `ReportFacts { planets: PlanetDetail[], houseLords, dignities, strengths, aspects, yogas, transits, firedRules: { marriage[], career[] }, d9, d10 }` stored as `facts jsonb` (new nullable column; migration `002_facts.sql`).
- Prompt appends a FACTS block and instructs: use only these; where a rule fired, weave its meaning; never mention placements not listed.

## Information architecture
Report page = `ReportShell` with a left rail (desktop) / segmented bar (mobile) of 4 groups: Overview, Chart, Insights, Timing; each group has its own tabs. URL hash `#chart/planets`. A quick-jump input filters section titles. Share route `/report/<uid>` renders `ReportView mode="share"`: no actions, minimal header, footer CTA. Match: `/match/<uid>` gets `?share=1`-free approach — actions only shown when arrived from creation (`sessionStorage` flag is state, not persistence) — NO: simpler, actions always on `/match/<uid>` but a separate `/match/<uid>/share` view-only route.

## Guided form
3 steps with progress; lighter inputs (surface fill, accent 2px focus ring, larger labels); step 2 live mini-chart via `POST /api/preview` (chart only, no AI, no save); step 3 pillar cards. `MatchForm` = same steps, two columns for person steps.

## Out of scope
Jaimini, full Shadbala, health/wealth rule corpora (AI-only for those pillars, as today).
