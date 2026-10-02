/**
 * Bhrigu Samhita predictions: a static Ascendant × Planet × House lookup table, sourced from
 * "Bhrigu Samhita" (original by Maharishi Bhrigu, abridged English edition by Dr. T.M. Rao).
 * Extracted and verified from the source text directly (archive.org, "Jyotish" collection) --
 * not AI-generated. 1,294 of the theoretical 1,296 combinations are present; the other 2
 * (Gemini-ascendant Sun in the 5th, Leo-ascendant Sun in the 10th) are absent from the printed
 * source itself, confirmed by inspecting the surrounding text directly rather than a parsing
 * failure -- left out rather than invented.
 *
 * Unlike Lal Kitab/Classical Indications, this needs no per-report computation or facts storage:
 * every report already has `chart.lagna` and `chart.houseOf[planet]`, so the only new work is a
 * lookup against this bundled dataset.
 */
import type { Planet } from "../signs";
import type { Language } from "@/src/reports/types";
import en from "./predictions-en.json";
import hi from "./predictions-hi.json";

/** The minimum a chart needs to provide for a Bhrigu lookup -- satisfied by both the live
 * `Chart` (astro/chart.ts) and the persisted `ChartSummary` stored on a report. */
interface LagnaChart {
  lagna: string;
  houseOf: Record<string, number>;
}

type PredictionTable = Record<string, Partial<Record<Planet, Partial<Record<number, string>>>>>;
const TABLES: Record<Language, PredictionTable> = { en: en as PredictionTable, hi: hi as PredictionTable };

export interface BhriguPrediction {
  planet: Planet;
  house: number;
  text: string;
}

/** One prediction, for a specific planet already known to be in a specific house. */
export function bhriguPrediction(lagna: string, planet: Planet, house: number, lang: Language): string | undefined {
  return TABLES[lang][lagna]?.[planet]?.[house];
}

/** All available predictions for a chart, one per planet that has an entry for its actual house. */
export function bhriguPredictions(chart: LagnaChart, lang: Language): BhriguPrediction[] {
  const planets: Planet[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const out: BhriguPrediction[] = [];
  for (const planet of planets) {
    const house = chart.houseOf[planet];
    const text = bhriguPrediction(chart.lagna, planet, house, lang);
    if (text) out.push({ planet, house, text });
  }
  return out;
}
