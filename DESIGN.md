# AstroTrue — Design System

## Theme
Light: pure white surface, near-black ink. Dark: deep warm charcoal, soft ivory ink. Follows system preference; manual toggle stored as `theme` in localStorage.

## Color (OKLCH)
| Role | Light | Dark |
|---|---|---|
| bg | `oklch(1 0 0)` | `oklch(0.17 0.008 80)` |
| surface | `oklch(0.975 0.003 80)` | `oklch(0.215 0.009 80)` |
| ink | `oklch(0.2 0.01 80)` | `oklch(0.94 0.008 80)` |
| muted | `oklch(0.45 0.01 80)` | `oklch(0.72 0.01 80)` |
| line | `oklch(0.9 0.005 80)` | `oklch(0.3 0.01 80)` |
| accent (honey) | `oklch(0.62 0.13 80)` | `oklch(0.8 0.14 80)` |
| strength (verdigris) | `oklch(0.52 0.09 170)` | `oklch(0.75 0.1 170)` |
| concern (terracotta) | `oklch(0.55 0.14 35)` | `oklch(0.75 0.13 35)` |

Strategy: Restrained. Accent ≤10% of any screen; semantic colors only on badges/markers.

## Typography
- Display: Spectral (500/600, italic for emphasis) — headings, hero, report titles.
- Body/UI: Geist (400/500/600) — everything else.
- Hindi: Noto Sans Devanagari for body; Tiro Devanagari Hindi for display.
- Scale: 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75 / 2.25 / clamp(2.5rem, 5vw, 4.5rem) hero.

## Motion
150–250ms ease-out-quart for state; the CosmicLoader orbit is the one ambient animation (6s linear), disabled under reduced-motion (static moon + fading text).

## Components
Button (primary/secondary/ghost), Chip (toggle), Badge (strength/concern/neutral), Card (single level, 1px line, no nesting), Meter (guna score), Section (report section with heading + optional caption), CosmicLoader, ErrorState, EmptyState, NorthChart (SVG).
