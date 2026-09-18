/**
 * ReportFacts: everything the rules engine and the UI's Chart/Yogas/Timing views need, computed
 * deterministically from the chart and stored with the report so pages never recompute or re-fetch.
 */
import type { Chart } from "@/src/astro/chart";
import { planetDetails, houseLords, planetsInHouses } from "@/src/astro/precise";
import { computeAspects } from "@/src/astro/aspects";
import { computeStrengths } from "@/src/astro/strength";
import { vargaChart } from "@/src/astro/varga";
import { detectYogas } from "@/src/astro/yogas";
import { computeTransits } from "@/src/astro/transits";
import { evaluateAll } from "@/src/rules";
import { ReportFactsSchema, type ReportFacts } from "./facts-schema";

export { ReportFactsSchema, type ReportFacts } from "./facts-schema";

export function computeFacts(chart: Chart, today = new Date()): ReportFacts {
  const yogas = detectYogas(chart);
  const strengths = computeStrengths(chart);
  const vargas = { D9: vargaChart(chart, "D9"), D10: vargaChart(chart, "D10") };
  const facts: ReportFacts = {
    version: 1,
    planets: planetDetails(chart),
    houseLords: Object.fromEntries(Object.entries(houseLords(chart)).map(([h, p]) => [h, p])),
    planetsInHouses: Object.fromEntries(Object.entries(planetsInHouses(chart)).map(([h, ps]) => [h, ps])),
    strengths,
    aspects: computeAspects(chart),
    vargas,
    yogas,
    transits: computeTransits(chart, today),
    rules: evaluateAll({ chart, yogas, strengths, vargas }),
  };
  return ReportFactsSchema.parse(facts);
}

/** Compact, unambiguous text block for the AI prompt. */
export function factsForPrompt(f: ReportFacts): string {
  const lines: string[] = [];
  lines.push("PLANET DETAILS (sign degree, house, nakshatra, dignity, strength 0-100, flags):");
  for (const p of f.planets) {
    if (p.body === "Ascendant") continue;
    const s = f.strengths.find((x) => x.planet === p.body);
    const flags = [s?.combust ? "combust" : "", p.retro === "retrograde" ? "retrograde" : ""].filter(Boolean).join(", ");
    lines.push(`  ${p.body}: ${p.sign} ${p.dms}, house ${p.house}, ${p.nakshatra.name} pada ${p.nakshatra.pada}, ${s?.dignity}, strength ${s?.score}${flags ? `, ${flags}` : ""}`);
  }
  lines.push("HOUSE LORDS: " + Object.entries(f.houseLords).map(([h, p]) => `${h}:${p}`).join(" "));
  lines.push("YOGAS PRESENT:");
  for (const y of f.yogas.filter((y) => y.present)) {
    lines.push(`  ${y.name}${y.cancelled ? " (CANCELLED: " + y.cancellationReasons.join("; ") + ")" : ""} grade ${y.grade}/3${y.activeInDasha ? ", ACTIVE in current dasha" : ""}. ${y.reason}`);
  }
  if (!f.yogas.some((y) => y.present)) lines.push("  none");
  lines.push("CLASSICAL RULES THAT FIRED (use these as the backbone of career and love sections; confidence tells you how firmly to phrase):");
  for (const d of ["career", "marriage"] as const) {
    for (const r of f.rules[d]) lines.push(`  [${d}, weight ${r.weight}, ${r.positive ? "favourable" : "concern"}, ${r.confidence}] ${r.title}: ${r.text} (because ${r.because.join("; ")})`);
  }
  lines.push(`CURRENT TRANSITS (${f.transits.date}):`);
  for (const t of f.transits.planets) lines.push(`  ${t.planet} in ${t.sign}, house ${t.houseFromLagna} from Lagna, ${t.houseFromMoon} from Moon${t.retrograde ? ", retrograde" : ""}`);
  for (const i of f.transits.intersections) lines.push(`  NOTE: ${i}`);
  lines.push(`D9 (Navamsa) Lagna: ${f.vargas.D9.lagna}; D9 7th lord placement is reflected in the marriage rules above.`);
  lines.push(`D10 (Dasamsa) Lagna: ${f.vargas.D10.lagna}.`);
  return lines.join("\n");
}
