import type { Chart } from "./chart";
import { PLANETS, type Planet } from "./signs";
import { getDignity, DIGNITY_POINTS, isCombust, type Dignity } from "./dignity";
import { computeAspects } from "./aspects";
import { getNakshatra } from "./nakshatras";

export const KENDRA = new Set([1, 4, 7, 10]);
export const TRIKONA = new Set([1, 5, 9]);
export const DUSTHANA = new Set([6, 8, 12]);
export const UPACHAYA = new Set([3, 6, 10, 11]);
export const NATURAL_BENEFICS: Planet[] = ["Jupiter", "Venus", "Mercury", "Moon"];
export const NATURAL_MALEFICS: Planet[] = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"];

export type ConfidenceBand = "direct" | "moderate" | "soft";

export interface PlanetStrength {
  planet: Planet;
  score: number;
  dignity: Dignity;
  combust: boolean;
  retrograde: boolean;
  house: number;
  beneficAspects: number;
  maleficAspects: number;
  band: ConfidenceBand;
  notes: string[];
}

export function confidenceBand(score: number): ConfidenceBand {
  return score >= 80 ? "direct" : score >= 50 ? "moderate" : "soft";
}

function housePoints(house: number): number {
  if (house === 1 || house === 10) return 25;
  if (KENDRA.has(house) || TRIKONA.has(house)) return 22;
  if (house === 11 || house === 2) return 16;
  if (house === 3) return 12;
  if (DUSTHANA.has(house)) return house === 6 ? 8 : 4;
  return 12;
}

/** Simplified Shadbala-style strength, 0–100 per planet. */
export function computeStrengths(chart: Chart): PlanetStrength[] {
  const asp = computeAspects(chart);
  return PLANETS.map((p) => {
    const notes: string[] = [];
    const dignity = getDignity(p, chart.d1[p], chart.degreesInSign[p]);
    let score = DIGNITY_POINTS[dignity];
    notes.push(dignity);
    const house = chart.houseOf[p];
    score += housePoints(house);

    const received = asp.filter((a) => a.toHouse === house && a.from !== p);
    const beneficAspects = received.filter((a) => NATURAL_BENEFICS.includes(a.from)).length;
    const maleficAspects = received.filter((a) => NATURAL_MALEFICS.includes(a.from)).length;
    score += Math.min(20, beneficAspects * 8) - Math.min(12, maleficAspects * 4);
    if (beneficAspects) notes.push(`${beneficAspects} benefic aspect${beneficAspects > 1 ? "s" : ""}`);
    if (maleficAspects) notes.push(`${maleficAspects} malefic aspect${maleficAspects > 1 ? "s" : ""}`);

    const retrograde = p !== "Sun" && p !== "Moon" && p !== "Rahu" && p !== "Ketu" && (chart.speeds[p] ?? 0) < 0;
    const combust = p !== "Sun" && isCombust(p, chart.longitudes[p], chart.longitudes.Sun, retrograde);
    if (combust) { score -= 15; notes.push("combust"); }
    if (retrograde) { score -= 3; notes.push("retrograde"); }

    if (getNakshatra(chart.longitudes[p]).lord === p) { score += 4; notes.push("in own nakshatra"); }

    score = Math.max(0, Math.min(100, Math.round(score)));
    return { planet: p, score, dignity, combust, retrograde, house, beneficAspects, maleficAspects, band: confidenceBand(score), notes };
  });
}
