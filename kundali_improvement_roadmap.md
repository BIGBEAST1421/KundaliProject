# KUNDALI PROJECT — ROADMAP TO CLOSE THE GAP WITH ASTROSAGE-LEVEL PREDICTIONS

## CONTEXT
Layer 1 (the chart math: planetary positions, ayanamsa, houses, nakshatra, dasha) is deterministic and you can get it arcsecond-accurate. That is NOT where AstroSage feels "phenomenal" and you feel "vague." The gap is almost entirely in Layer 2 — the prediction/rules engine. This file lists what to add, in the order to build it.

## PART 1 — DATA / STRUCTURE YOU NEED TO ADD

### 1. Planetary Dignity Table
- For each of the 9 grahas: exaltation degree, debilitation degree, own signs, moolatrikona range, friend/enemy/neutral sign list.
- Add a function: `get_dignity(planet, sign, degree) -> exalted / own / moolatrikona / friendly / neutral / enemy / debilitated`
- Add combustion check: planet's angular distance from Sun < threshold (varies per planet) -> combust flag.

### 2. Shadbala (or a simplified strength score) — OPTIONAL but high value
- Full shadbala is 6 sub-strengths; for v1, a simplified weighted score using dignity + house placement + aspects is enough.
- Output: a 0-100 strength score per planet. This is what lets you later say "may" vs "will" instead of flat statements.

### 3. Aspect (Drishti) Engine
- Standard 7th house aspect for all planets, plus special aspects: Mars (4th, 8th), Jupiter (5th, 9th), Saturn (3rd, 10th).
- Function: `get_aspects(chart) -> list of (planet, aspected_house, aspected_planet_if_any)`

### 4. Yoga Detection Library
- Build as boolean-check functions, one yoga per function, e.g.: `is_gajakesari_yoga(chart)`, `is_kemadruma_yoga(chart)`, `is_raja_yoga(chart)`, `is_dhana_yoga(chart)`, `is_manglik(chart)`
- IMPORTANT: every dosha function must also check its own cancellation conditions (e.g. manglik cancellation if Mars is in own/exalted sign, or aspected by Jupiter, etc.) and return `cancelled=True/False`, not just `triggered=True/False`.

### 5. Divisional Chart (Varga) Calculators
- You likely already compute D1. Add at minimum:
  - D9 (Navamsa) — for marriage, spouse, general life strength
  - D10 (Dasamsa) — for career
  - D7 (Saptamsa) — for children, if you want that domain
- Each is pure arithmetic on longitude (documented ratios), reuse your existing longitude data, don't re-fetch from ephemeris.

### 6. Dasha-Transit Intersection Engine
- You already compute Vimshottari mahadasha/antardasha periods.
- Add: current transit positions (same ephemeris call, for today's date) -> compare transiting planets against natal chart houses/planets -> flag exact intersections (e.g. "transiting Saturn is currently aspecting natal Moon while you are in Mars-Ketu antardasha").
- This is the single feature that makes predictions feel "current" instead of generic/fixed.

### 7. Rules Corpus — restructure from flat to combinatorial
- Do NOT write rules like: `{"condition": "Mars in 7th", "text": "..."}`
- Instead structure each rule as a combination of conditions that must ALL be true, e.g.:
```json
{
  "domain": "marriage",
  "conditions": [
    {"planet": "Mars", "house": 7},
    {"planet": "Mars", "dignity_in": ["debilitated","enemy"]},
    {"dosha": "manglik", "cancelled": false}
  ],
  "confidence_weight": "high",
  "text": "..."
}
```
- Build a small rule-matching engine that checks ALL conditions in a rule before it fires, and only surfaces rules where all conditions match. Rank fired rules by `confidence_weight` before stitching output.

### 8. Confidence / Hedging Language Layer
- Map strength score (from #2) to phrasing:
  - 80-100 -> direct statement ("this indicates...")
  - 50-79  -> moderate ("this suggests...", "there is a tendency toward...")
  - <50    -> soft ("this may contribute to...", "a minor influence toward...")
- This alone fixes a lot of the "over the top" feeling.

## PART 1B — RAJ YOGA DETECTION (differentiator feature — most apps do this shallowly or not at all with proper sub-types)

Raj Yoga = combinations that grant power, status, success. Classical (Parashari/BPHS) Raj Yoga is not one rule — it is a family of distinct patterns. Build each as its own checked function, don't lump into one:

### 1. Kendra-Trikona Raja Yoga (the core type)
- Lord of a kendra house (1,4,7,10) conjoins OR exchanges signs with (parivartana) OR mutually aspects the lord of a trikona house (1,5,9). Note: house 1 counts as both kendra and trikona, so lagna lord is always a key player.
- Must compute: `house_lord(house_num, chart) -> which planet rules it` based on lagna sign, then check conjunction/exchange/aspect between those two lords.
- Grade the yoga by dignity of both lords involved (exalted lords forming this = much stronger than debilitated lords forming it).

### 2. Viparita Raja Yoga
- Lords of 6th, 8th, and 12th houses (dusthana/malefic houses) placed IN each other's houses (i.e., 6th lord in 8th or 12th, 8th lord in 6th or 12th, 12th lord in 6th or 8th).
- Produces success through reversal/difficulty rather than direct placement — different tone of prediction text needed.

### 3. Neecha Bhanga Raja Yoga (debilitation-cancellation Raj Yoga)
- A debilitated planet's debilitation gets cancelled under specific classical conditions (e.g. the dispositor of its debilitation sign is in a kendra from lagna or Moon, or the debilitated planet's exaltation lord is in a kendra, or the debilitated planet is conjunct/aspected by its dispositor).
- When cancelled, the planet can give a very strong, specific type of rise-from-difficulty result — this is a favorite in classical texts and rarely implemented correctly in apps.

### 4. Dharma-Karmadhipati Yoga
- Special case of Kendra-Trikona RY specifically between 9th lord (dharma) and 10th lord (karma) — considered one of the strongest Raj Yogas when present, worth flagging separately even though it's technically a subtype of #1.

### 5. Raja Yoga strength/ranking
- Once multiple Raj Yogas are detected in one chart, rank them by: dignity of planets involved, whether they're in kendra/trikona themselves, whether dasha period matches the yoga's planets (a Raj Yoga only "activates" strongly during the dasha of its participating planets — this is important, don't just report it as always-on).
- This ranking + dasha-activation check is what makes your Raj Yoga output feel earned rather than a generic "you have raj yoga!" flag.

## PART 1C — PRECISE LAGNA CHART OUTPUT (accuracy/display requirement)

"No vague things" — the chart itself must show exact data, not just sign placement:

### 1. 
For every planet AND the lagna, output degree-minute-second within its sign, not just the sign name.
Example: not "Mars in Scorpio" but `Mars: Scorpio 14°27'53"`
- pyswisseph gives you longitude as a float in degrees (0-360).
  ```python
  sign = int(longitude / 30)
  degree_in_sign = longitude % 30
  ```
  Convert `degree_in_sign` to D° M' S" format for display.

### 2. 
Show retrograde status explicitly per planet (Mercury/Venus/Mars/Jupiter/Saturn can retrograde; Sun/Moon never do; Rahu/Ketu are always retrograde by convention — state this rather than omitting).

### 3. 
Show nakshatra AND pada for every planet, not just the Moon (most apps only show nakshatra for Moon; showing it for all planets, especially lagna, is a differentiator and needed for later Raj Yoga and dasha-lord accuracy checks).

### 4. 
Show house lordship explicitly on the chart — i.e., label each house with which planet rules it, not just which planet sits in it. This is required input data for the Raj Yoga engine above, so build it as a reusable function: `get_house_lord(house_num, lagna_sign) -> planet`.

### 5. 
Cross-verify against a second source, not just AstroSage — use Jagannatha Hora (free, desktop, widely considered the most technically rigorous Vedic software) as your ground truth for degree-level precision, since it exposes raw values AstroSage sometimes rounds or hides in its consumer UI.

## PART 1D — NOTE ON JAIMINI SYSTEM (optional future stretch, not required)

Parashari (BPHS) is the system this entire roadmap targets — it's the classical/mainstream approach and what AstroSage etc. use. A separate classical system called Jaimini (different karakas — Atmakaraka etc, different dasha type called Chara Dasha, sutra-based reasoning) exists and is rarely implemented well in consumer apps. Not required for parity with AstroSage, but genuinely rare — worth a "v2" flag if you want a second real differentiator after Raj Yoga.

## PART 2 — BUILD ORDER (do this in sequence, not in parallel)

- **Step 1:** Verify Layer 1 math against AstroSage/Jagannatha Hora for 2-3 known birth details (lagna degree, Moon nakshatra should match exactly). Do not proceed until this matches.
- **Step 1B:** Build precise Lagna chart output (Part 1C) — degree/minute/second, retrograde flags, nakshatra+pada for all planets, house lordship function. Do this right after Step 1 since later features (Raj Yoga, yogas) all depend on house lordship data.
- **Step 2:** Add Dignity Table + combustion check (Part 1, item 1).
- **Step 3:** Add Aspect Engine (item 3).
- **Step 4:** Pick ONE prediction domain only — recommend "marriage" or "career" since these have the most reference material online. Do not try to cover all life areas yet.
- **Step 5:** For that one domain, build the Yoga/Dosha functions relevant to it (item 4), including cancellation logic. If domain allows, include Raj Yoga detection (Part 1B) here too since it's a strong differentiator — recommend prioritizing it early.
- **Step 6:** Add the relevant Varga chart for that domain (D9 for marriage, D10 for career) (item 5).
- **Step 7:** Restructure your rules as combinatorial JSON (item 7) — write 15-20 deep, multi-condition rules for this one domain rather than 100 shallow single-condition rules.
- **Step 8:** Add the confidence/hedging layer (item 8) so output tone varies.
- **Step 9:** Add Dasha-Transit intersection (item 6) so predictions can reference current timing, not just static placements.
- **Step 10:** Test output against AstroSage's report for the same birth data in this one domain. Compare specificity and tone, not just correctness. Iterate on the rules corpus based on gaps.
- **Step 11:** Only after one domain feels genuinely sharp, repeat steps 4-10 for a second domain (career, health, finance, etc.).

## PART 3 — REFERENCE MATERIAL TO GATHER BEFORE WRITING RULES

- A classical yoga/dosha reference (e.g. content from BPHS - Brihat Parashara Hora Shastra - summaries, or a structured yoga list) to source your rule conditions and cancellation logic from, rather than inventing conditions yourself.
- 3-5 sample AstroSage reports for known charts (yours, family, friends with consent) to reverse-engineer what conditions produced which statements — use these as your test/validation set for Step 10.

## NOTE ON SCOPE
Full AstroSage-level depth across all life domains is a multi-year corpus-building effort. The build order above is designed to get ONE domain to feel genuinely sharp first, which is both a realistic project milestone and the best way to learn the pattern before scaling it out.
