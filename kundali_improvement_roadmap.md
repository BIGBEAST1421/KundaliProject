# Kundali Project: Next.js Implementation Spec for LLM Assistants

## 1. System Prompt & Context for LLM

**Role:** You are an expert Full-Stack Next.js Developer and a Vedic Astrology Domain Expert. Your goal is to help implement "Layer 2" (Prediction & Rules Engine) of a Kundali (Astrology) application, elevating its prediction quality to match top-tier apps like AstroSage.

**Tech Stack:** 
- Framework: Next.js (App Router, React Server Components, Server Actions)
- Language: TypeScript
- Data: Combinatorial JSON for rules evaluation
- Astrology Core (Layer 1): Ephemeris calculations (e.g., via `swisseph` npm package in Node.js, or querying an external Python microservice using `pyswisseph`). *All Layer 1 math must be handled server-side to prevent client bundle bloat.*

**Critical Next.js Rules (for the LLM):**
- You must verify current Next.js documentation in `node_modules/next/dist/docs/` before assuming APIs or file structures, as the environment may have breaking changes.
- Use Server Components by default. Keep astrology calculations, ephemeris data processing, and rule evaluations strictly on the server.
- Expose complex calculations or state updates to the frontend via Server Actions or Next.js API Routes (`app/api/...`).

---

## 2. Architecture & Data Structures (TypeScript Spec)

### 2.1. Layer 1: Core Calculation Types
```typescript
interface PlanetPosition {
  planet: string; // e.g., 'Sun', 'Moon', 'Mars', 'Rahu'
  longitude: number; // 0-360 degrees
  sign: number; // 0-11
  degreeInSign: number; // 0-29.999
  retrograde: boolean;
  nakshatra: string;
  pada: number; // 1-4
  isCombust: boolean;
}

interface ChartData {
  lagna: PlanetPosition;
  planets: PlanetPosition[]; // Array of the 9 grahas
  houses: Record<number, string>; // House number (1-12) mapped to ruling planet
}
```

### 2.2. Layer 2: Prediction Engine Types
```typescript
type Dignity = 'exalted' | 'own' | 'moolatrikona' | 'friendly' | 'neutral' | 'enemy' | 'debilitated';

interface Condition {
  planet?: string;
  house?: number;
  dignity_in?: Dignity[];
  dosha?: string;
  cancelled?: boolean;
}

interface PredictionRule {
  domain: 'marriage' | 'career' | 'health' | 'finance';
  conditions: Condition[]; // ALL conditions must be met (AND logic)
  confidence_weight: 'high' | 'medium' | 'low';
  text: string; // The resulting prediction text
}
```

---

## 3. Implementation Roadmap (Strict Sequential Order)

**LLM Instruction:** Execute these steps in strict sequence. Do not parallelize tasks across different phases.

### Phase 1: Core Data & Formatting (Server-Side)
1. **Verify Layer 1 Math (API Route):** Build an endpoint to verify calculations against AstroSage/Jagannatha Hora for 2-3 known birth details. Lagna degree and Moon nakshatra must match exactly before proceeding.
2. **Precise Chart Formatting (Utility):** Create formatting utilities in `lib/` to output `degree-minute-second` (e.g., `Mars: Scorpio 14°27'53"`). Convert `degree_in_sign` (longitude % 30) to D° M' S" format.
3. **Chart UI (React Server Component):** Build a Server Component to display the precise Lagna chart. It must explicitly show retrograde status (except for Sun/Moon; note Rahu/Ketu are always retrograde by convention). Show nakshatra and pada for every planet, not just the Moon.
4. **House Lordship Mapping:** Build a reusable utility function `get_house_lord(house_num, lagna_sign) -> planet`. Label each house on the UI with its ruling planet.

### Phase 2: Astrological Engines (Server Utilities)
5. **Dignity & Combustion Engine:**
   - Function: `get_dignity(planet, sign, degree) -> Dignity`
   - Function: `is_combust(planet, sun_distance) -> boolean`
6. **Aspect (Drishti) Engine:**
   - Function: `get_aspects(chart) -> { planet, aspected_house, aspected_planet_if_any }[]`
   - Standard 7th house aspect for all + special aspects (Mars: 4,8; Jupiter: 5,9; Saturn: 3,10).
7. **Shadbala (Strength Score - Optional but High Value):**
   - Output: 0-100 strength score per planet. Used for dynamic text generation ("may" vs "will").

### Phase 3: The Rules Engine & Domains
8. **Yoga / Dosha Detection Library:**
   - Build boolean functions: `is_gajakesari_yoga`, `is_manglik`, etc.
   - **Crucial:** Every dosha function must check its own cancellation conditions and return an object: `{ triggered: boolean, cancelled: boolean }`.
9. **Raj Yoga Sub-types (Differentiator):**
   - Build separate detectors for: *Kendra-Trikona*, *Viparita*, *Neecha Bhanga*, *Dharma-Karmadhipati*.
   - Rank multiple Raj Yogas by planet dignity and dasha-activation.
10. **Varga Calculators:** Implement Divisional Charts (pure math based on longitude). Add D9 (Navamsa) for marriage, and D10 (Dasamsa) for career.
11. **Combinatorial Rules Engine:**
    - Refactor any flat rules into combinatorial JSON (see `PredictionRule` interface).
    - Build a matching engine (Server Utility) that evaluates rules against the generated `ChartData` and filters out non-matches.
12. **Confidence / Hedging Language Layer:**
    - Map Shadbala scores to phrasing: `80-100` -> "this indicates", `50-79` -> "there is a tendency toward", `<50` -> "this may contribute to".
13. **Dasha-Transit Intersection:**
    - Compare transiting planets against the natal chart to flag exact current intersections (e.g., "transiting Saturn is currently aspecting natal Moon while you are in Mars-Ketu antardasha").

### Phase 4: Validation & Scaling
14. **Test Domain (e.g., Marriage):** Run end-to-end tests for a single domain against 3-5 AstroSage reports. Compare specificity, tone, and accuracy. Iterate on the JSON rules corpus.
15. **Scale:** Only after one domain feels genuinely sharp, repeat Steps 8-14 for a second domain (career, health, finance, etc.).

---

## 4. LLM Generation Tasks

When the user assigns a specific step from the roadmap, you must:
1. Review the TypeScript interfaces and context outlined above.
2. Plan the Next.js App Router structure (e.g., `/app/api/calculate/route.ts`, `/app/components/Chart.tsx`, `/lib/astrology/rules.ts`).
3. Generate the implementation leveraging Server Components for data fetching/processing, and Server Actions for user interactions.
4. Prioritize clean separation of concerns: Keep heavy astrological logic in `/lib` or `/services`, separate from the UI components.
5. Provide unit tests for pure logical engines (like Yogas, Aspects, Dignities).
