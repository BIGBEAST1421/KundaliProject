/**
 * ReportFacts: everything the rules engine and the UI's Chart/Yogas/Timing views need, computed
 * deterministically from the chart and stored with the report so pages never recompute or re-fetch.
 */
import { z } from "zod";
import type { Chart } from "@/src/astro/chart";
import { planetDetails, houseLords, planetsInHouses } from "@/src/astro/precise";
import { computeAspects } from "@/src/astro/aspects";
import { computeStrengths } from "@/src/astro/strength";
import { vargaChart } from "@/src/astro/varga";
import { detectYogas } from "@/src/astro/yogas";
import { computeTransits } from "@/src/astro/transits";
import { evaluateAll } from "@/src/rules";

const str = z.string();
const num = z.number();
const planet = str;

const NakshatraSchema = z.object({ name: str, lord: str, deity: str, index: num, pada: num, degree: num });

export const PlanetDetailSchema = z.object({
  body: str, longitude: num, sign: str, degInSign: num, dms: str, house: num, nakshatra: NakshatraSchema,
  retro: z.enum(["direct", "retrograde", "always-retrograde", "never"]), speed: num,
});
export const StrengthSchema = z.object({
  planet, score: num, dignity: str, combust: z.boolean(), retrograde: z.boolean(), house: num,
  beneficAspects: num, maleficAspects: num, band: z.enum(["direct", "moderate", "soft"]), notes: z.array(str),
});
export const AspectSchema = z.object({ from: planet, fromHouse: num, toHouse: num, toPlanets: z.array(planet), special: z.boolean() });
export const VargaSchema = z.object({ name: str, signs: z.record(str, str), lagna: str, houseOf: z.record(str, num) });
export const YogaSchema = z.object({
  key: str, name: str, kind: z.enum(["yoga", "dosha", "rajayoga"]), present: z.boolean(), cancelled: z.boolean(),
  cancellationReasons: z.array(str), grade: z.union([z.literal(1), z.literal(2), z.literal(3)]), participants: z.array(planet),
  houses: z.array(num), activeInDasha: z.boolean(), summary: str, reason: str,
});
export const TransitSchema = z.object({
  date: str,
  planets: z.array(z.object({ planet, longitude: num, sign: str, houseFromLagna: num, houseFromMoon: num, retrograde: z.boolean() })),
  sadeSati: z.object({ phase: z.enum(["rising", "peak", "setting"]), note: str }).nullable(),
  hits: z.array(z.object({ transiting: planet, natal: planet, kind: z.enum(["conjunction", "aspect"]), orb: num.optional() })),
  intersections: z.array(str),
});
export const FiredRuleSchema = z.object({
  id: str, domain: z.enum(["marriage", "career"]), title: str, text: str, weight: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  positive: z.boolean(), confidence: z.enum(["direct", "moderate", "soft"]), keyPlanets: z.array(planet), because: z.array(str),
});

export const ReportFactsSchema = z.object({
  version: z.literal(1),
  planets: z.array(PlanetDetailSchema),
  houseLords: z.record(str, str),
  planetsInHouses: z.record(str, z.array(str)),
  strengths: z.array(StrengthSchema),
  aspects: z.array(AspectSchema),
  vargas: z.object({ D9: VargaSchema, D10: VargaSchema }),
  yogas: z.array(YogaSchema),
  transits: TransitSchema,
  rules: z.object({ marriage: z.array(FiredRuleSchema), career: z.array(FiredRuleSchema) }),
});
export type ReportFacts = z.infer<typeof ReportFactsSchema>;

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
