/**
 * Zod schema for ReportFacts. Kept free of astro/sweph imports so it is safe in client bundles.
 */
import { z } from "zod";

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
